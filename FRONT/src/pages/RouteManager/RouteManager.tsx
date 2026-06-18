import { useMemo, useState, useEffect, useCallback, useRef } from "react";
import type { FormEvent } from "react";
import {
    Paper,
    Group,
    Title,
    Text,
    Button,
    Table,
    ScrollArea,
    Stack,
    Modal,
    TextInput,
    Select,
    ActionIcon,
    Divider,
    Box,
    Grid,
    Card,
    Badge,
} from "@mantine/core";
import { Plus, Pencil, Trash, DotsSixVertical, X } from "phosphor-react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
    useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import "leaflet/dist/leaflet.css";
import type { Route, RouteForm } from "../../types/route.types";
import { ROUTE_PERIODICITY_OPTIONS } from "../../constants/routePeriodicity.constants";
import { useRoutesApi } from "../../hooks/useRoutesApi";
import { useStopsApi, type StopRecord } from "../../hooks/useStopsApi";
import { useStudentsApi, type StudentRecord } from "../../hooks/useStudentsApi";

const emptyForm: RouteForm = {
    name: "",
    startStopId: "",
    endStopId: "",
    startTime: "",
    endTime: "",
    periodicity: "daily",
    selectedStudents: [],
    stopSequence: [],
};

interface SortableItemProps {
    id: string;
    children: React.ReactNode;
}

function SortableItem({ id, children }: SortableItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {children}
        </div>
    );
}

const RouteManager = () => {
    const { listRoutes, createRoute, updateRoute, deleteRoute } = useRoutesApi();
    const { listStops } = useStopsApi();
    const { listStudents } = useStudentsApi();

    const [routes, setRoutes] = useState<Route[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [form, setForm] = useState<RouteForm>(emptyForm);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
    const [selectedStudentToAdd, setSelectedStudentToAdd] = useState<string>("");
    const [selectedStopToAdd, setSelectedStopToAdd] = useState<string>("");
    const [routeCoordinates, setRouteCoordinates] = useState<[number, number][]>([]);
    const [isCalculatingRoute, setIsCalculatingRoute] = useState(false);
    const [isFallbackRoute, setIsFallbackRoute] = useState(false);
    const routeRequestController = useRef<AbortController | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [stops, setStops] = useState<StopRecord[]>([]);
    const [students, setStudents] = useState<StudentRecord[]>([]);
    const [isStopsLoading, setIsStopsLoading] = useState(true);
    const [isStudentsLoading, setIsStudentsLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        const fetchRoutes = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const data = await listRoutes();
                if (!mounted) return;
                setRoutes(data);
            } catch (err) {
                if (!mounted) return;
                const message = err instanceof Error ? err.message : "Falha ao buscar rotas";
                setError(message);
            } finally {
                if (mounted) setIsLoading(false);
            }
        };

        void fetchRoutes();

        return () => {
            mounted = false;
        };
    }, [listRoutes]);

    useEffect(() => {
        let mounted = true;

        const fetchStops = async () => {
            try {
                setIsStopsLoading(true);
                const data = await listStops();
                if (!mounted) return;
                setStops(data);
            } catch (err) {
                if (!mounted) return;
                const message = err instanceof Error ? err.message : "Falha ao carregar paradas";
                setError(message);
            } finally {
                if (mounted) setIsStopsLoading(false);
            }
        };

        void fetchStops();

        return () => {
            mounted = false;
        };
    }, [listStops]);

    useEffect(() => {
        let mounted = true;

        const fetchStudents = async () => {
            try {
                setIsStudentsLoading(true);
                const data = await listStudents();
                if (!mounted) return;
                setStudents(data);
            } catch (err) {
                if (!mounted) return;
                const message = err instanceof Error ? err.message : "Falha ao carregar alunos";
                setError(message);
            } finally {
                if (mounted) setIsStudentsLoading(false);
            }
        };

        void fetchStudents();

        return () => {
            mounted = false;
        };
    }, [listStudents]);

    const stopLookup = useMemo(() => {
        const map = new Map<string, StopRecord>();
        for (const stop of stops) {
            map.set(stop.id, stop);
        }
        return map;
    }, [stops]);

    const studentLookup = useMemo(() => {
        const map = new Map<string, StudentRecord>();
        for (const student of students) {
            map.set(student.id, student);
        }
        return map;
    }, [students]);

    const stopOptions = useMemo(
        () => stops.map((stop) => ({ value: stop.id, label: stop.name })),
        [stops],
    );

    const studentOptions = useMemo(
        () => students.map((student) => ({ value: student.id, label: student.name })),
        [students],
    );

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    // Calculate route using OSRM and fall back to straight segments if needed
    const calculateRoute = useCallback(async (stopIds: string[]) => {
        routeRequestController.current?.abort();

        if (stopIds.length < 2) {
            routeRequestController.current = null;
            setRouteCoordinates([]);
            setIsCalculatingRoute(false);
            setIsFallbackRoute(false);
            return;
        }

        const coordinates = stopIds
            .map((stopId) => {
                const stop = stopLookup.get(stopId);
                return stop ? [stop.lng, stop.lat] : null;
            })
            .filter(Boolean) as [number, number][];

        if (coordinates.length < 2) {
            routeRequestController.current = null;
            setRouteCoordinates([]);
            setIsCalculatingRoute(false);
            setIsFallbackRoute(false);
            return;
        }

        const controller = new AbortController();
        routeRequestController.current = controller;
        setIsCalculatingRoute(true);

        try {
            const coordString = coordinates.map((coord) => coord.join(",")).join(";");
            const response = await fetch(
                `https://router.project-osrm.org/route/v1/driving/${coordString}?overview=full&geometries=geojson`,
                { signal: controller.signal },
            );

            if (!response.ok) {
                throw new Error(`OSRM request failed with status ${response.status}`);
            }

            const data = await response.json();

            if (controller.signal.aborted || routeRequestController.current !== controller) {
                return;
            }

            const geometry = data.routes?.[0]?.geometry?.coordinates;

            if (geometry?.length) {
                setRouteCoordinates(
                    geometry.map(([lng, lat]: [number, number]) => [lat, lng]),
                );
                setIsFallbackRoute(false);
                setIsCalculatingRoute(false);
                routeRequestController.current = null;
                return;
            }
        } catch (error) {
            if (error instanceof DOMException && error.name === "AbortError") {
                return;
            }
            console.error("Error calculating route via OSRM:", error);
        }

        if (routeRequestController.current !== controller) {
            return;
        }

        const fallback = stopIds
            .map((stopId) => {
                const stop = stopLookup.get(stopId);
                return stop ? [stop.lat, stop.lng] : null;
            })
            .filter(Boolean) as [number, number][];

        setRouteCoordinates(fallback);
        setIsFallbackRoute(true);
        setIsCalculatingRoute(false);
        routeRequestController.current = null;
    }, [stopLookup]);

    // Calculate route when stop sequence changes
    useEffect(() => {
        void calculateRoute(form.stopSequence);
    }, [calculateRoute, form.stopSequence]);

    useEffect(() => () => {
        routeRequestController.current?.abort();
    }, []);

    const openCreateModal = () => {
        setModalMode("create");
        setForm(emptyForm);
        setEditingId(null);
        routeRequestController.current?.abort();
        routeRequestController.current = null;
        setRouteCoordinates([]);
        setIsCalculatingRoute(false);
        setIsFallbackRoute(false);
        setIsModalOpen(true);
    };

    const openEditModal = (route: Route) => {
        setModalMode("edit");
        setEditingId(route.id);
        setForm({
            name: route.name,
            startStopId: route.startStopId,
            endStopId: route.endStopId,
            startTime: route.startTime,
            endTime: route.endTime,
            periodicity: route.periodicity,
            selectedStudents: route.selectedStudents,
            stopSequence: route.stopSequence,
        });
        void calculateRoute(route.stopSequence);
        setIsModalOpen(true);
    };

    const handleFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        try {
            setIsSaving(true);
            setError(null);
            if (modalMode === "create") {
                const created = await createRoute(form);
                setRoutes((prev) => [...prev, created]);
            } else if (editingId) {
                const updated = await updateRoute(editingId, form);
                setRoutes((prev) =>
                    prev.map((route) => (route.id === updated.id ? updated : route))
                );
            }
            setIsModalOpen(false);
            setEditingId(null);
            setForm(emptyForm);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao salvar rota";
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    const addStudent = () => {
        if (
            selectedStudentToAdd &&
            studentLookup.has(selectedStudentToAdd) &&
            !form.selectedStudents.includes(selectedStudentToAdd)
        ) {
            setForm((prev) => ({
                ...prev,
                selectedStudents: [...prev.selectedStudents, selectedStudentToAdd],
            }));
            setSelectedStudentToAdd("");
        }
    };

    const removeStudent = (studentId: string) => {
        setForm((prev) => ({
            ...prev,
            selectedStudents: prev.selectedStudents.filter((id) => id !== studentId),
        }));
    };

    const addStop = () => {
        if (
            selectedStopToAdd &&
            stopLookup.has(selectedStopToAdd) &&
            !form.stopSequence.includes(selectedStopToAdd)
        ) {
            setForm((prev) => ({
                ...prev,
                stopSequence: [...prev.stopSequence, selectedStopToAdd],
            }));
            setSelectedStopToAdd("");
        }
    };

    const removeStop = (stopId: string) => {
        setForm((prev) => ({
            ...prev,
            stopSequence: prev.stopSequence.filter((id) => id !== stopId),
        }));
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setForm((prev) => {
                const oldIndex = prev.stopSequence.indexOf(active.id as string);
                const newIndex = prev.stopSequence.indexOf(over.id as string);

                return {
                    ...prev,
                    stopSequence: arrayMove(prev.stopSequence, oldIndex, newIndex),
                };
            });
        }
    };

    const openDeleteModal = (route: Route) => {
        setRouteToDelete(route);
    };

    const confirmDelete = async () => {
        if (!routeToDelete) return;
        try {
            setIsDeleting(true);
            setError(null);
            await deleteRoute(routeToDelete.id);
            setRoutes((prev) => prev.filter((route) => route.id !== routeToDelete.id));
            setRouteToDelete(null);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Falha ao excluir rota";
            setError(message);
        } finally {
            setIsDeleting(false);
        }
    };

    const cancelDelete = () => setRouteToDelete(null);

    const totalStudents = students.length;
    const totalStops = stops.length;

    const isDataLoading = isLoading || isStopsLoading || isStudentsLoading;

    return (
        <Paper shadow="md" radius={18} p={32} maw={1200} mx="auto" my={32}>
            <Stack gap={32}>
                <Group justify="space-between" align="flex-start">
                    <Stack gap={4}>
                        <Title order={1} size={32} fw={900}>
                            Gerenciamento de Rotas
                        </Title>
                        <Text c="dimmed" size="sm">
                            Organize as rotas de transporte, vinculando alunos e paradas.
                        </Text>
                        <Group gap="xs">
                            <Text size="xs" c="dimmed">
                                {routes.length} rotas cadastradas
                            </Text>
                            <Divider orientation="vertical" />
                            <Text size="xs" c="dimmed">
                                {totalStudents} alunos disponíveis
                            </Text>
                            <Divider orientation="vertical" />
                            <Text size="xs" c="dimmed">
                                {totalStops} paradas disponíveis
                            </Text>
                        </Group>
                    </Stack>
                    <Button
                        leftSection={<Plus size={18} />}
                        onClick={openCreateModal}
                        radius="md"
                        disabled={isStopsLoading || stopOptions.length === 0}
                    >
                        Nova rota
                    </Button>
                </Group>

                <ScrollArea>
                    <Table highlightOnHover verticalSpacing="md">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Nome da rota</Table.Th>
                                <Table.Th>Periodicidade</Table.Th>
                                <Table.Th>Nº de alunos</Table.Th>
                                <Table.Th>Nº de paradas</Table.Th>
                                <Table.Th style={{ width: 160 }}>Ações</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {isDataLoading ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>
                                        <Text ta="center">Carregando rotas...</Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : error ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>
                                        <Text ta="center" c="red">{error}</Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : routes.length === 0 ? (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>
                                        <Text c="dimmed" ta="center">
                                            Nenhuma rota cadastrada até o momento.
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ) : (
                                routes.map((route) => (
                                    <Table.Tr key={route.id}>
                                        <Table.Td>
                                            <Stack gap={4}>
                                                <Text fw={600}>{route.name}</Text>
                                                <Text size="sm" c="dimmed">
                                                    {route.startTime} - {route.endTime}
                                                </Text>
                                            </Stack>
                                        </Table.Td>
                                        <Table.Td>
                                            <Badge variant="light">{ROUTE_PERIODICITY_OPTIONS.find(option => option.value === route.periodicity)?.label ?? route.periodicity}</Badge>
                                        </Table.Td>
                                        <Table.Td>{route.selectedStudents.length}</Table.Td>
                                        <Table.Td>{route.stopSequence.length}</Table.Td>
                                        <Table.Td>
                                            <Group gap={8}>
                                                <Button
                                                    size="xs"
                                                    variant="subtle"
                                                    leftSection={<Pencil size={16} />}
                                                    onClick={() => openEditModal(route)}
                                                    disabled={isSaving}
                                                >
                                                    Editar
                                                </Button>
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={() => openDeleteModal(route)}
                                                    aria-label="Excluir rota"
                                                    disabled={isDeleting}
                                                >
                                                    <Trash size={18} />
                                                </ActionIcon>
                                            </Group>
                                        </Table.Td>
                                    </Table.Tr>
                                ))
                            )}
                        </Table.Tbody>
                    </Table>
                </ScrollArea>
            </Stack>

            <Modal
                opened={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={modalMode === "create" ? "Cadastrar nova rota" : "Editar rota"}
                centered
                size="xl"
                styles={{ body: { padding: 0 } }}
            >
                <form onSubmit={handleFormSubmit}>
                    <Stack gap={0}>
                        {/* Map Section */}
                        <Box h={256} bg="gray.1" style={{ position: 'relative' }}>
                            {isCalculatingRoute && (
                                <Box
                                    style={{
                                        position: 'absolute',
                                        top: 10,
                                        left: 10,
                                        zIndex: 1000,
                                        background: 'rgba(255, 255, 255, 0.9)',
                                        padding: '8px 12px',
                                        borderRadius: 4,
                                        fontSize: '12px',
                                        color: '#666'
                                    }}
                                >
                                    Calculando rota...
                                </Box>
                            )}
                            <MapContainer
                                center={[-23.5505, -46.6333]} // São Paulo coordinates
                                zoom={13}
                                style={{ height: "100%", width: "100%" }}
                            >
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                {form.stopSequence.map((stopId, index) => {
                                    const stop = stopLookup.get(stopId);
                                    if (!stop) return null;
                                    return (
                                        <Marker key={stopId} position={[stop.lat, stop.lng]}>
                                            <Popup>
                                                {stop.name} (Posição {index + 1})
                                            </Popup>
                                        </Marker>
                                    );
                                })}
                                {form.stopSequence.length > 1 && routeCoordinates.length > 0 && (
                                    <Polyline
                                        positions={routeCoordinates}
                                        color={isFallbackRoute ? "red" : "blue"}
                                        weight={4}
                                        opacity={0.8}
                                        dashArray={isFallbackRoute ? "10, 10" : undefined}
                                    />
                                )}
                            </MapContainer>
                        </Box>

                        {/* Form Content */}
                        <Box p={24}>
                            <Grid gutter="md">
                                <Grid.Col span={12}>
                                    <TextInput
                                        label="Nome da Rota"
                                        placeholder="Ex: Rota Matutina Centro"
                                        value={form.name}
                                        onChange={(event) => {
                                            const nextValue = event.currentTarget.value;
                                            setForm((prev) => ({ ...prev, name: nextValue }));
                                        }}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Select
                                        label="Parada de Início"
                                        placeholder="Selecione a parada de início"
                                        data={stopOptions}
                                        value={form.startStopId}
                                        onChange={(value) => setForm((prev) => ({ ...prev, startStopId: value || "" }))}
                                        required
                                        disabled={isStopsLoading || stopOptions.length === 0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <Select
                                        label="Parada Final"
                                        placeholder="Selecione a parada final"
                                        data={stopOptions}
                                        value={form.endStopId}
                                        onChange={(value) => setForm((prev) => ({ ...prev, endStopId: value || "" }))}
                                        required
                                        disabled={isStopsLoading || stopOptions.length === 0}
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Horário de Início"
                                        type="time"
                                        value={form.startTime}
                                        onChange={(event) => {
                                            const nextValue = event.currentTarget.value;
                                            setForm((prev) => ({ ...prev, startTime: nextValue }));
                                        }}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={6}>
                                    <TextInput
                                        label="Horário de Fim"
                                        type="time"
                                        value={form.endTime}
                                        onChange={(event) => {
                                            const nextValue = event.currentTarget.value;
                                            setForm((prev) => ({ ...prev, endTime: nextValue }));
                                        }}
                                        required
                                    />
                                </Grid.Col>
                                <Grid.Col span={12}>
                                    <Select
                                        label="Periodicidade"
                                        data={ROUTE_PERIODICITY_OPTIONS}
                                        value={form.periodicity}
                                        onChange={(value) => setForm((prev) => ({ ...prev, periodicity: value || "daily" }))}
                                        required
                                    />
                                </Grid.Col>
                            </Grid>

                            {/* Student Selection */}
                            <Box mt={24}>
                                <Text fw={600} size="sm" mb="xs">
                                    Seleção de Alunos
                                </Text>
                                <Card withBorder p="md">
                                    <Group gap="xs" mb="md">
                                        <Select
                                            placeholder="Selecione um aluno"
                                            data={studentOptions}
                                            value={selectedStudentToAdd}
                                            onChange={(value) => setSelectedStudentToAdd(value || "")}
                                            style={{ flex: 1 }}
                                            disabled={isStudentsLoading || studentOptions.length === 0}
                                        />
                                        <Button
                                            leftSection={<Plus size={16} />}
                                            onClick={addStudent}
                                            disabled={
                                                isStudentsLoading ||
                                                studentOptions.length === 0 ||
                                                !selectedStudentToAdd ||
                                                !studentLookup.has(selectedStudentToAdd)
                                            }
                                        >
                                            Adicionar
                                        </Button>
                                    </Group>
                                    <Stack gap="xs">
                                        {form.selectedStudents.map((studentId) => {
                                            const student = studentLookup.get(studentId);
                                            return (
                                                <Group key={studentId} justify="space-between" p="xs" bg="gray.0" style={{ borderRadius: 4 }}>
                                                    <Text size="sm">{student ? student.name : "Aluno desconhecido"}</Text>
                                                    <ActionIcon
                                                        color="red"
                                                        variant="subtle"
                                                        onClick={() => removeStudent(studentId)}
                                                        size="sm"
                                                    >
                                                        <X size={16} />
                                                    </ActionIcon>
                                                </Group>
                                            );
                                        })}
                                    </Stack>
                                </Card>
                            </Box>

                            {/* Stop Sequence */}
                            <Box mt={24}>
                                <Text fw={600} size="sm" mb="xs">
                                    Sequência de Paradas
                                </Text>
                                <Card withBorder p="md">
                                    <Group gap="xs" mb="md">
                                        <Select
                                            placeholder="Selecione uma parada"
                                            data={stopOptions}
                                            value={selectedStopToAdd}
                                            onChange={(value) => setSelectedStopToAdd(value || "")}
                                            style={{ flex: 1 }}
                                            disabled={isStopsLoading || stopOptions.length === 0}
                                        />
                                        <Button
                                            leftSection={<Plus size={16} />}
                                            onClick={addStop}
                                            disabled={
                                                isStopsLoading ||
                                                stopOptions.length === 0 ||
                                                !selectedStopToAdd ||
                                                !stopLookup.has(selectedStopToAdd)
                                            }
                                        >
                                            Adicionar Parada
                                        </Button>
                                    </Group>
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <SortableContext items={form.stopSequence} strategy={verticalListSortingStrategy}>
                                            <Stack gap="xs">
                                                {form.stopSequence.map((stopId, index) => {
                                                    const stop = stopLookup.get(stopId);
                                                    return (
                                                        <SortableItem key={stopId} id={stopId}>
                                                            <Group justify="space-between" p="xs" bg="gray.0" style={{ borderRadius: 4, cursor: "grab" }}>
                                                                <Group gap="xs">
                                                                    <DotsSixVertical size={16} />
                                                                    <Text size="sm">
                                                                        Parada {index + 1}: {stop ? stop.name : "Parada desconhecida"}
                                                                    </Text>
                                                                </Group>
                                                                <ActionIcon
                                                                    color="red"
                                                                    variant="subtle"
                                                                    onClick={() => removeStop(stopId)}
                                                                    size="sm"
                                                                >
                                                                    <X size={16} />
                                                                </ActionIcon>
                                                            </Group>
                                                        </SortableItem>
                                                    );
                                                })}
                                            </Stack>
                                        </SortableContext>
                                    </DndContext>
                                </Card>
                            </Box>

                            <Group justify="flex-end" gap={12} mt={32}>
                                <Button
                                    variant="default"
                                    onClick={() => setIsModalOpen(false)}
                                    type="button"
                                    disabled={isSaving}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" loading={isSaving} disabled={isSaving}>
                                    {modalMode === "create" ? "Salvar Rota" : "Atualizar Rota"}
                                </Button>
                            </Group>
                        </Box>
                    </Stack>
                </form>
            </Modal>

            <Modal
                opened={!!routeToDelete}
                onClose={cancelDelete}
                title="Confirmar exclusão"
                centered
                size="sm"
            >
                <Stack gap={12}>
                    <Text>
                        Tem certeza de que deseja excluir a rota
                        {" "}
                        <Text span fw={700}>
                            “{routeToDelete?.name}”
                        </Text>
                        ?
                    </Text>
                    <Text size="sm" c="dimmed">
                        Essa ação é irreversível e removerá os vínculos com alunos e paradas.
                    </Text>
                    <Group justify="flex-end" gap={12} mt={8}>
                        <Button variant="default" onClick={cancelDelete}>
                            Cancelar
                        </Button>
                        <Button color="red" onClick={confirmDelete} loading={isDeleting} disabled={isDeleting}>
                            Excluir rota
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Paper>
    );
};

export default RouteManager;