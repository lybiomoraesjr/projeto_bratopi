import { useEffect, useMemo, useState } from 'react';
import {
  Paper,
  Group,
  Button,
  Title,
  Text,
  Input,
  Badge,
  Modal,
  TextInput,
  Select,
  Checkbox,
  Grid,
} from '@mantine/core';
import { DataTable } from 'mantine-datatable';
import { Pencil, Trash, Warning, Plus, MagnifyingGlass } from 'phosphor-react';
import { initialStudents, schools } from '../../mock/student.mock';
import type { Student } from '../../types/student.types';
import {
  useStudentsApi,
  type StudentRecord,
  type StudentPayload,
} from '../../hooks/useStudentsApi';

type StudentFormValues = Omit<Student, 'status'> & { status: boolean };

const toPayload = (form: StudentFormValues): StudentPayload => ({
  name: form.name,
  email: form.email,
  cpf: form.cpf,
  matricula: form.matricula,
  turno: form.turno,
  escola: form.escola,
  endereco: form.endereco,
  telefone: form.telefone,
  status: form.status ? 'Ativo' : 'Inativo',
});

const toFormValues = (student: StudentRecord): StudentFormValues => ({
  name: student.name,
  email: student.email,
  cpf: student.cpf,
  matricula: student.matricula,
  turno: student.turno,
  escola: student.escola,
  endereco: student.endereco,
  telefone: student.telefone,
  status: student.status === 'Ativo',
});

const buildEmptyForm = (): StudentFormValues => ({
  name: '',
  email: '',
  cpf: '',
  matricula: '',
  turno: '',
  escola: '',
  endereco: '',
  telefone: '',
  status: true,
});

const StudentManagement = () => {
  const fallbackStudents = useMemo<StudentRecord[]>(
    () =>
      initialStudents.map((student, index) => ({
        ...student,
        id: student.matricula || `fallback-${index}`,
      })),
    [],
  );

  const { listStudents, createStudent, updateStudent, deleteStudent } = useStudentsApi();

  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [search, setSearch] = useState<string>('');
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
  const [editModalOpen, setEditModalOpen] = useState<boolean>(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState<boolean>(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentRecord | null>(null);
  const [addForm, setAddForm] = useState<StudentFormValues>(buildEmptyForm());
  const [editForm, setEditForm] = useState<StudentFormValues>(buildEmptyForm());
  const [isTableLoading, setIsTableLoading] = useState<boolean>(false);
  const [isSavingAdd, setIsSavingAdd] = useState<boolean>(false);
  const [isSavingEdit, setIsSavingEdit] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [generalError, setGeneralError] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const fetchStudents = async () => {
      setIsTableLoading(true);
      setGeneralError('');
      try {
        const data = await listStudents();
        if (isMounted) {
          setStudents(data);
        }
      } catch (error) {
        if (error instanceof Error) {
          setGeneralError(error.message);
        } else {
          setGeneralError('Falha ao carregar alunos da API.');
        }
        if (isMounted) {
          setStudents(fallbackStudents);
        }
      } finally {
        if (isMounted) {
          setIsTableLoading(false);
        }
      }
    };

    fetchStudents();

    return () => {
      isMounted = false;
    };
  }, [fallbackStudents, listStudents]);

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.matricula.includes(search) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.cpf.includes(search)
  );

  const openAddModal = () => {
    setAddForm(buildEmptyForm());
    setAddModalOpen(true);
    setGeneralError('');
  };

  const handleEdit = (student: StudentRecord) => {
    setEditForm(toFormValues(student));
    setSelectedStudent(student);
    setEditModalOpen(true);
    setGeneralError('');
  };

  const handleDelete = (student: StudentRecord) => {
    setSelectedStudent(student);
    setDeleteModalOpen(true);
    setGeneralError('');
  };

  const handleAdd = async () => {
    setIsSavingAdd(true);
    setGeneralError('');
    try {
      const payload = toPayload(addForm);
      const created = await createStudent(payload);
  setStudents((prev) => [...prev, created]);
      setAddModalOpen(false);
      setAddForm(buildEmptyForm());
    } catch (error) {
      if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError('Não foi possível adicionar o aluno.');
      }
    } finally {
      setIsSavingAdd(false);
    }
  };

  const handleEditSave = async () => {
    if (!selectedStudent) {
      return;
    }

    setIsSavingEdit(true);
    setGeneralError('');
    try {
      const payload = toPayload(editForm);
      const updated = await updateStudent(selectedStudent.id, payload);
      setStudents((prev) =>
  prev.map((s) => (s.id === selectedStudent.id ? updated : s))
      );
      setEditModalOpen(false);
      setSelectedStudent(null);
      setEditForm(buildEmptyForm());
    } catch (error) {
      if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError('Não foi possível atualizar o aluno.');
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) {
      return;
    }

    setIsDeleting(true);
    setGeneralError('');
    try {
      await deleteStudent(selectedStudent.id);
  setStudents((prev) => prev.filter((s) => s.id !== selectedStudent.id));
      setDeleteModalOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      if (error instanceof Error) {
        setGeneralError(error.message);
      } else {
        setGeneralError('Não foi possível excluir o aluno.');
      }
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Paper shadow="md" radius={18} p={32} maw={1200} mx="auto" mt={32}>
      <Group justify="space-between" align="center" mb={24}>
        <Title order={1} size={32} fw={900}>
          Gerenciamento de Alunos
        </Title>
        <Button
          leftSection={<Plus size={18} />}
          onClick={openAddModal}
        >
          Adicionar Aluno
        </Button>
      </Group>
      {generalError && (
        <Text c="red" mb={16}>
          {generalError}
        </Text>
      )}
      <Group mb={16}>
        <Input
          leftSection={<MagnifyingGlass size={18} />}
          placeholder="Buscar por nome ou matrícula"
          value={search}
          onChange={(e) => {
            const value = e.currentTarget.value;
            setSearch(value);
          }}
          size="md"
          radius={8}
          style={{ maxWidth: 340 }}
        />
      </Group>
  <DataTable<StudentRecord>
        idAccessor="id"
        columns={[
          { accessor: 'name', title: 'Nome' },
          { accessor: 'email', title: 'E-mail' },
          { accessor: 'cpf', title: 'CPF' },
          { accessor: 'matricula', title: 'Matrícula' },
          { accessor: 'turno', title: 'Turno' },
          { accessor: 'escola', title: 'Escola' },
          { accessor: 'endereco', title: 'Endereço' },
          { accessor: 'telefone', title: 'Telefone' },
          {
            accessor: 'status',
            title: 'Status',
            render: (row: StudentRecord) => (
              <Badge color={row.status === 'Ativo' ? 'green' : 'gray'} variant="light">
                {row.status}
              </Badge>
            ),
          },
          {
            accessor: 'actions',
            title: 'Ações',
            textAlign: 'right',
            render: (row: StudentRecord) => (
              <Group gap={4} justify="end">
                <Button variant="subtle" color="blue" size="compact-md" radius={50} onClick={() => handleEdit(row)}>
                  <Pencil size={16} />
                </Button>
                <Button variant="subtle" color="red" size="compact-md" radius={50} onClick={() => handleDelete(row)}>
                  <Trash size={16} />
                </Button>
              </Group>
            ),
          },
        ]}
        records={filteredStudents}
  fetching={isTableLoading}
        striped
        highlightOnHover
        withTableBorder
        withColumnBorders
        minHeight={200}
        noRecordsText="Nenhum aluno encontrado"
      />

      {/* Modal de Adicionar */}
      <Modal
        opened={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Adicionar Novo Aluno"
        centered
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleAdd();
          }}
        >
          <Grid gutter={12}>
            <Grid.Col span={6}>
              <TextInput
                label="Nome completo"
                value={addForm.name}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setAddForm((f) => ({ ...f, name: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="E-mail"
                value={addForm.email}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setAddForm((f) => ({ ...f, email: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="CPF"
                value={addForm.cpf}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setAddForm((f) => ({ ...f, cpf: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Matrícula"
                value={addForm.matricula}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setAddForm((f) => ({ ...f, matricula: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Turno"
                data={['Matutino', 'Vespertino', 'Noturno']}
                value={addForm.turno}
                onChange={(v) => setAddForm((f) => ({ ...f, turno: v || '' }))}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Escola"
                data={schools}
                value={addForm.escola}
                onChange={(v) => setAddForm((f) => ({ ...f, escola: v || '' }))}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Endereço"
                value={addForm.endereco}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setAddForm((f) => ({ ...f, endereco: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Telefone"
                value={addForm.telefone}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setAddForm((f) => ({ ...f, telefone: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Checkbox
                label="Status Ativo"
                checked={addForm.status}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setAddForm((f) => ({ ...f, status: checked }));
                }}
              />
            </Grid.Col>
          </Grid>
          <Group justify="end" mt={24}>
            <Button variant="default" onClick={() => setAddModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" color="blue" loading={isSavingAdd}>
              Salvar
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Modal de Editar */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Aluno"
        centered
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            await handleEditSave();
          }}
        >
          <Grid gutter={12}>
            <Grid.Col span={6}>
              <TextInput
                label="Nome completo"
                value={editForm.name}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setEditForm((f) => ({ ...f, name: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="E-mail"
                value={editForm.email}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setEditForm((f) => ({ ...f, email: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="CPF"
                value={editForm.cpf}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setEditForm((f) => ({ ...f, cpf: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Matrícula"
                value={editForm.matricula}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setEditForm((f) => ({ ...f, matricula: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Turno"
                data={['Matutino', 'Vespertino', 'Noturno']}
                value={editForm.turno}
                onChange={(v) => setEditForm((f) => ({ ...f, turno: v || '' }))}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Select
                label="Escola"
                data={schools}
                value={editForm.escola}
                onChange={(v) => setEditForm((f) => ({ ...f, escola: v || '' }))}
                required
              />
            </Grid.Col>
            <Grid.Col span={12}>
              <TextInput
                label="Endereço"
                value={editForm.endereco}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setEditForm((f) => ({ ...f, endereco: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TextInput
                label="Telefone"
                value={editForm.telefone}
                onChange={(e) => {
                  const value = e.currentTarget.value;
                  setEditForm((f) => ({ ...f, telefone: value }));
                }}
                required
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <Checkbox
                label="Status Ativo"
                checked={editForm.status}
                onChange={(e) => {
                  const checked = e.currentTarget.checked;
                  setEditForm((f) => ({ ...f, status: checked }));
                }}
              />
            </Grid.Col>
          </Grid>
          <Group justify="end" mt={24}>
            <Button color="red" variant="light" onClick={() => { setEditModalOpen(false); setDeleteModalOpen(true); }}>
              Excluir
            </Button>
            <Button variant="default" onClick={() => setEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" color="blue" loading={isSavingEdit}>
              Salvar
            </Button>
          </Group>
        </form>
      </Modal>

      {/* Modal de Confirmação de Exclusão */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Excluir Aluno"
        centered
      >
        <Group align="center" gap={8}>
          <Warning size={48} color="#e8590c" />
          <Text size="lg" fw={500} ta="center">
            Tem certeza que deseja excluir este aluno?
          </Text>
          <Group justify="center" mt={16}>
            <Button color="red" onClick={() => void handleDeleteConfirm()} loading={isDeleting}>
              Sim, tenho certeza
            </Button>
            <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
              Não, cancelar
            </Button>
          </Group>
        </Group>
      </Modal>
    </Paper>
  );
};

export default StudentManagement;