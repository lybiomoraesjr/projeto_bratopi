import { useEffect, useMemo, useState } from "react";
import {
  Paper,
  Group,
  Button,
  Title,
  Text,
  Badge,
  Input,
  SegmentedControl,
  rem,
  Loader,
  Alert,
} from "@mantine/core";
import { DataTable } from "mantine-datatable";
import { MagnifyingGlass, Eye, Play, WarningCircle } from "phosphor-react";
import {
  useDashboardApi,
  type DashboardRouteFilters,
  type DashboardSummary,
  type DashboardRouteRecord,
} from "../../hooks/useDashboardApi";

const Dashboard = () => {
  const { getRoutes, getSummary } = useDashboardApi();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [routes, setRoutes] = useState<DashboardRouteRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [search, setSearch] = useState<string>("");
  const [isSummaryLoading, setIsSummaryLoading] = useState<boolean>(true);
  const [isRoutesLoading, setIsRoutesLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const filterParams = useMemo<DashboardRouteFilters>(() => {
    const params: DashboardRouteFilters = {};
    if (statusFilter !== "todos") params.status = statusFilter;
    if (search.trim()) params.search = search.trim();
    return params;
  }, [statusFilter, search]);

  useEffect(() => {
    let mounted = true;
    const fetchSummary = async () => {
      try {
        setIsSummaryLoading(true);
        setError(null);
        const data = await getSummary({ status: filterParams.status });
        if (!mounted) return;
        setSummary(data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar resumo");
      } finally {
        if (mounted) setIsSummaryLoading(false);
      }
    };

    void fetchSummary();

    return () => {
      mounted = false;
    };
  }, [getSummary, filterParams.status]);

  useEffect(() => {
    let mounted = true;
    const fetchRoutes = async () => {
      try {
        setIsRoutesLoading(true);
        setError(null);
        const data = await getRoutes(filterParams);
        if (!mounted) return;
        setRoutes(data);
      } catch (err) {
        if (!mounted) return;
        setError(err instanceof Error ? err.message : "Falha ao carregar rotas");
      } finally {
        if (mounted) setIsRoutesLoading(false);
      }
    };

    void fetchRoutes();

    return () => {
      mounted = false;
    };
  }, [getRoutes, filterParams]);

  const summaryValues: DashboardSummary = summary ?? {
    totalRoutes: 0,
    inProgress: 0,
    finished: 0,
    alerts: 0,
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #e0e7ff 0%, #f0f4ff 100%)",
      }}
    >
      <Group justify="center" align="flex-start" style={{ minHeight: "100vh" }}>
        <Paper
          w="100%"
          maw={1280}
          radius={18}
          p={0}
          style={{ margin: rem(32), overflow: "hidden" }}
        >
          {/* Main */}
          <main style={{ padding: "32px 40px" }}>
            <Group justify="space-between" align="center" mb={32} wrap="wrap">
              <Title order={1} size={36} fw={900} c="#1e293b">
                Dashboard - Rotas de Hoje
              </Title>
              {isSummaryLoading && <Loader size="sm" color="blue" />}
            </Group>
            {error && (
              <Alert
                icon={<WarningCircle size={20} />}
                title="Erro ao carregar dados"
                color="red"
                mb={24}
                radius="md"
              >
                {error}
              </Alert>
            )}
            {/* Cards */}
            <Group gap={24} mb={32} wrap="wrap">
              <Paper
                p={24}
                radius={16}
                shadow="xs"
                withBorder
                style={{ minWidth: 158, flex: 1, maxWidth: 300 }}
              >
                <Text size="md" c="dimmed" fw={500} mb={4}>
                  Rotas Totais
                </Text>
                <Text size="2xl" fw={700} c="#1e293b">
                  {summaryValues.totalRoutes}
                </Text>
              </Paper>
              <Paper
                p={24}
                radius={16}
                shadow="xs"
                withBorder
                style={{ minWidth: 158, flex: 1, maxWidth: 300 }}
              >
                <Text size="md" c="dimmed" fw={500} mb={4}>
                  Em Andamento
                </Text>
                <Text size="2xl" fw={700} c="#1e293b">
                  {summaryValues.inProgress}
                </Text>
              </Paper>
              <Paper
                p={24}
                radius={16}
                shadow="xs"
                withBorder
                style={{ minWidth: 158, flex: 1, maxWidth: 300 }}
              >
                <Text size="md" c="dimmed" fw={500} mb={4}>
                  Concluídas
                </Text>
                <Text size="2xl" fw={700} c="#1e293b">
                  {summaryValues.finished}
                </Text>
              </Paper>
              <Paper
                p={24}
                radius={16}
                shadow="xs"
                withBorder
                style={{ minWidth: 158, flex: 1, maxWidth: 300 }}
              >
                <Text size="md" c="dimmed" fw={500} mb={4}>
                  Alertas
                </Text>
                <Text size="2xl" fw={700} c="red">
                  {summaryValues.alerts}
                </Text>
              </Paper>
            </Group>
            {/* Filtros e busca */}
            <Group justify="space-between" align="center" mb={24} wrap="wrap">
              <SegmentedControl
                data={[
                  { label: "Todos", value: "todos" },
                  { label: "Em andamento", value: "andamento" },
                  { label: "Concluído", value: "concluido" },
                  { label: "Atrasado", value: "atrasado" },
                ]}
                value={statusFilter}
                onChange={setStatusFilter}
                size="md"
                radius={8}
                color="blue"
              />
              <Input
                leftSection={<MagnifyingGlass size={18} color="#94a3b8" />}
                placeholder="Buscar por Motorista/Veículo"
                size="md"
                radius={8}
                style={{ width: 260, background: "#f1f5f9" }}
                value={search}
                onChange={(event) => setSearch(event.currentTarget.value)}
              />
            </Group>
            {/* DataTable Mantine */}
            <DataTable
              columns={[
                {
                  accessor: 'name',
                  title: 'Nome da Rota',
                  render: (row) => <Text fw={600}>{row.name}</Text>,
                },
                { accessor: 'vehicle', title: 'Veículo' },
                { accessor: 'driver', title: 'Motorista' },
                {
                  accessor: 'status',
                  title: 'Status',
                  render: (row) => (
                    <Badge
                      color={
                        row.statusColor === 'yellow'
                          ? 'yellow'
                          : row.statusColor === 'green'
                          ? 'green'
                          : row.statusColor === 'red'
                          ? 'red'
                          : 'gray'
                      }
                      variant="light"
                      size="md"
                    >
                      {row.status}
                    </Badge>
                  ),
                },
                { accessor: 'partida', title: 'Partida' },
                { accessor: 'chegada', title: 'Chegada Prevista' },
                {
                  accessor: 'actions',
                  title: 'Ações',
                  textAlign: 'right',
                  render: (row) => (
                    <Group gap={4} justify="end">
                      <Button
                        variant="subtle"
                        color="blue"
                        radius={50}
                        size="compact-md"
                        title="Ver detalhes"
                      >
                        <Eye size={18} />
                      </Button>
                      {row.actions.includes('start') && (
                        <Button
                          variant="subtle"
                          color="green"
                          radius={50}
                          size="compact-md"
                          title="Iniciar rota"
                        >
                          <Play size={18} />
                        </Button>
                      )}
                    </Group>
                  ),
                },
              ]}
              records={routes}
              fetching={isRoutesLoading}
              striped
              highlightOnHover
              withTableBorder
              withColumnBorders
              minHeight={200}
            />
          </main>
        </Paper>
      </Group>
    </div>
  );
};

export default Dashboard;
