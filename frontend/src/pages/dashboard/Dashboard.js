import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Paper, Grid, CircularProgress, 
  Alert, Chip, Card, CardContent, CardActions,
  Button, Divider, List, ListItem, ListItemText,
  ListItemIcon, LinearProgress
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  CheckCircle as CheckCircleIcon,
  Pending as PendingIcon,
  Error as ErrorIcon,
  Schedule as ScheduleIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';

const Dashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    blockedTasks: 0,
    projectsCount: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Obtener tareas asignadas al usuario
      const tasksResponse = await axios.get('/api/tasks/assigned');
      setAssignedTasks(tasksResponse.data);
      
      // Obtener proyectos del usuario
      const projectsResponse = await axios.get('/api/projects');
      setProjects(projectsResponse.data);
      
      // Calcular estadísticas
      const allTasks = tasksResponse.data;
      const completedTasks = allTasks.filter(task => task.status === 'Completada');
      const pendingTasks = allTasks.filter(task => task.status === 'Pendiente');
      const inProgressTasks = allTasks.filter(task => task.status === 'En Progreso');
      const blockedTasks = allTasks.filter(task => task.status === 'Bloqueada');
      
      setStats({
        totalTasks: allTasks.length,
        completedTasks: completedTasks.length,
        pendingTasks: pendingTasks.length,
        inProgressTasks: inProgressTasks.length,
        blockedTasks: blockedTasks.length,
        projectsCount: projectsResponse.data.length
      });
      
      setError('');
    } catch (err) {
      setError('Error al cargar los datos del panel');
      console.error(err);
    } finally {
      setLoading(false);
    }
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

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'en progreso': return <ScheduleIcon color="primary" />;
      case 'completada': return <CheckCircleIcon color="success" />;
      case 'pendiente': return <PendingIcon color="warning" />;
      case 'bloqueada': return <ErrorIcon color="error" />;
      default: return <AssignmentIcon />;
    }
  };

  const calculateCompletionPercentage = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
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

  return (
    <Layout>
      <Box sx={{ maxWidth: 1200, mx: 'auto', mt: 4, px: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Typography variant="h4" component="h1" gutterBottom>
          Panel de Usuario
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Bienvenido, {currentUser?.username || 'Usuario'}
        </Typography>
        
        {/* Resumen y estadísticas */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Progreso General
              </Typography>
              
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Tareas completadas</Typography>
                  <Typography variant="body2">{calculateCompletionPercentage()}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={calculateCompletionPercentage()} 
                  sx={{ height: 10, borderRadius: 5 }}
                />
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary.main">
                      {stats.totalTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total de tareas
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">
                      {stats.completedTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Completadas
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="warning.main">
                      {stats.pendingTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pendientes
                    </Typography>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="error.main">
                      {stats.blockedTasks}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Bloqueadas
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Mis Proyectos
              </Typography>
              
              {projects.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    No tienes proyectos asignados.
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small"
                    onClick={() => navigate('/projects/new')}
                    sx={{ mt: 1 }}
                  >
                    Crear Proyecto
                  </Button>
                </Box>
              ) : (
                <>
                  <List dense>
                    {projects.slice(0, 4).map(project => (
                      <ListItem 
                        key={project.id}
                        secondaryAction={
                          <Button 
                            size="small" 
                            endIcon={<ArrowForwardIcon />}
                            onClick={() => navigate(`/projects/${project.id}`)}
                          >
                            Ver
                          </Button>
                        }
                      >
                        <ListItemText
                          primary={project.name}
                          secondary={
                            <Chip 
                              label={project.status} 
                              color={getStatusColor(project.status)}
                              size="small"
                            />
                          }
                        />
                      </ListItem>
                    ))}
                  </List>
                  
                  {projects.length > 4 && (
                    <Box sx={{ textAlign: 'center', mt: 2 }}>
                      <Button 
                        variant="outlined" 
                        size="small"
                        onClick={() => navigate('/projects')}
                      >
                        Ver todos ({projects.length})
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        {/* Tareas asignadas */}
        <Typography variant="h5" gutterBottom>
          Mis Tareas Asignadas
        </Typography>
        
        {assignedTasks.length === 0 ? (
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              No tienes tareas asignadas actualmente.
            </Typography>
            <Button 
              variant="contained"
              onClick={() => navigate('/projects')}
              sx={{ mt: 2 }}
            >
              Explorar Proyectos
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {assignedTasks.map(task => (
              <Grid item xs={12} sm={6} md={4} key={task.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <ListItemIcon sx={{ minWidth: 40 }}>
                        {getStatusIcon(task.status)}
                      </ListItemIcon>
                      <Typography variant="h6" component="div" noWrap>
                        {task.title}
                      </Typography>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {task.description?.length > 100 
                        ? `${task.description.substring(0, 100)}...` 
                        : task.description || 'Sin descripción'}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={task.status} 
                        color={getStatusColor(task.status)}
                        size="small"
                      />
                      <Typography variant="caption" color="text.secondary">
                        Proyecto: {task.projectName}
                      </Typography>
                    </Box>
                    
                    {task.dueDate && (
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <ScheduleIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="caption" color="text.secondary">
                          Fecha límite: {new Date(task.dueDate).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                  <Divider />
                  <CardActions>
                    <Button 
                      size="small" 
                      onClick={() => navigate(`/projects/${task.projectId}/tasks/${task.id}`)}
                    >
                      Ver Detalles
                    </Button>
                    <Button 
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/projects/${task.projectId}`)}
                    >
                      Ir al Proyecto
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>
    </Layout>
  );
};

export default Dashboard;