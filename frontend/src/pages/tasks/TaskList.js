import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, 
  TableContainer, TableHead, TableRow, Chip, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, MenuItem, Select, FormControl, InputLabel,
  CircularProgress, Alert
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon,
  Comment as CommentIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/layout/Layout';

const TaskList = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para el filtro
  const [statusFilter, setStatusFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      // Obtener datos del proyecto
      const projectResponse = await axios.get(`/api/projects/${projectId}`);
      setProject(projectResponse.data);
      
      // Obtener tareas del proyecto
      const tasksResponse = await axios.get(`/api/projects/${projectId}/tasks`);
      setTasks(tasksResponse.data);
      
      // Obtener miembros del proyecto
      const membersResponse = await axios.get(`/api/projects/${projectId}/members`);
      setMembers(membersResponse.data);
      
      setError('');
    } catch (err) {
      setError('Error al cargar los datos del proyecto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = () => {
    navigate(`/projects/${projectId}/tasks/create`);
  };

  const handleEditTask = (taskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}/edit`);
  };

  const handleViewTask = (taskId) => {
    navigate(`/projects/${projectId}/tasks/${taskId}`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'en progreso': return 'primary';
      case 'completada': return 'success';
      case 'pendiente': return 'warning';
      case 'bloqueada': return 'error';
      default: return 'default';
    }
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status.toLowerCase() === statusFilter.toLowerCase();
      const matchesAssignee = assigneeFilter === 'all' || task.assigneeId === assigneeFilter;
      return matchesStatus && matchesAssignee;
    });
  };

  const getMemberName = (memberId) => {
    const member = members.find(m => m.id === memberId);
    return member ? member.username : 'No asignado';
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <Alert severity="error">Proyecto no encontrado</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Volver a Proyectos
        </Button>
      </Layout>
    );
  }

  const filteredTasks = getFilteredTasks();

  return (
    <Layout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1">
              Tareas: {project.name}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {project.description}
            </Typography>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              onClick={() => navigate(`/projects/${projectId}`)}
              sx={{ mr: 1 }}
            >
              Volver al Proyecto
            </Button>
            <Button 
              variant="contained" 
              startIcon={<AddIcon />}
              onClick={handleCreateTask}
            >
              Nueva Tarea
            </Button>
          </Box>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Filtros */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="status-filter-label">Estado</InputLabel>
              <Select
                labelId="status-filter-label"
                id="status-filter"
                value={statusFilter}
                label="Estado"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                <MenuItem value="pendiente">Pendiente</MenuItem>
                <MenuItem value="en progreso">En Progreso</MenuItem>
                <MenuItem value="completada">Completada</MenuItem>
                <MenuItem value="bloqueada">Bloqueada</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel id="assignee-filter-label">Asignado a</InputLabel>
              <Select
                labelId="assignee-filter-label"
                id="assignee-filter"
                value={assigneeFilter}
                label="Asignado a"
                onChange={(e) => setAssigneeFilter(e.target.value)}
              >
                <MenuItem value="all">Todos</MenuItem>
                {members.map(member => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Paper>

        {/* Lista de tareas */}
        {tasks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No hay tareas en este proyecto. ¡Crea una nueva tarea para comenzar!
            </Typography>
          </Paper>
        ) : filteredTasks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No hay tareas que coincidan con los filtros seleccionados.
            </Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper}>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Título</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Prioridad</TableCell>
                  <TableCell>Asignado a</TableCell>
                  <TableCell>Fecha límite</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => (
                  <TableRow
                    key={task.id}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                    hover
                    onClick={() => handleViewTask(task.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <TableCell component="th" scope="row">
                      {task.title}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={task.status} 
                        color={getStatusColor(task.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{task.priority}</TableCell>
                    <TableCell>{getMemberName(task.assigneeId)}</TableCell>
                    <TableCell>
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No definida'}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditTask(task.id);
                        }}
                        aria-label="editar tarea"
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${projectId}/tasks/${task.id}/comments`);
                        }}
                        aria-label="comentarios"
                        color="primary"
                      >
                        <CommentIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/projects/${projectId}/tasks/${task.id}/assign`);
                        }}
                        aria-label="asignar tarea"
                        color="secondary"
                      >
                        <AssignmentIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Layout>
  );
};

export default TaskList;