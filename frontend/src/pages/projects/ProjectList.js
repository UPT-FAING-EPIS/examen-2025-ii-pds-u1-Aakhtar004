import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Button, Card, CardContent, CardActions, 
  Grid, Chip, IconButton, Dialog, DialogTitle, DialogContent,
  DialogContentText, DialogActions, CircularProgress
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon, Group as GroupIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';

const ProjectList = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/api/projects');
      setProjects(response.data);
      setError('');
    } catch (err) {
      setError('Error al cargar los proyectos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = () => {
    navigate('/projects/create');
  };

  const handleEditProject = (projectId) => {
    navigate(`/projects/edit/${projectId}`);
  };

  const handleViewProject = (projectId) => {
    navigate(`/projects/${projectId}`);
  };

  const handleManageMembers = (projectId) => {
    navigate(`/projects/${projectId}/members`);
  };

  const openDeleteDialog = (project) => {
    setProjectToDelete(project);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setProjectToDelete(null);
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;
    
    try {
      await axios.delete(`/api/projects/${projectToDelete.id}`);
      setProjects(projects.filter(p => p.id !== projectToDelete.id));
      closeDeleteDialog();
    } catch (err) {
      setError('Error al eliminar el proyecto');
      console.error(err);
    }
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'en progreso': return 'primary';
      case 'completado': return 'success';
      case 'pendiente': return 'warning';
      default: return 'default';
    }
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
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Mis Proyectos
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={handleCreateProject}
          >
            Nuevo Proyecto
          </Button>
        </Box>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        {projects.length === 0 ? (
          <Card sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1">
              No tienes proyectos. ¡Crea uno nuevo para comenzar!
            </Typography>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {projects.map((project) => (
              <Grid item xs={12} sm={6} md={4} key={project.id}>
                <Card 
                  sx={{ 
                    height: '100%', 
                    display: 'flex', 
                    flexDirection: 'column',
                    '&:hover': {
                      boxShadow: 6
                    }
                  }}
                >
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {project.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {project.description}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip 
                        label={project.status} 
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                      <Typography variant="caption">
                        {new Date(project.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" onClick={() => handleViewProject(project.id)}>
                      Ver
                    </Button>
                    {project.ownerId === currentUser?.id && (
                      <>
                        <IconButton 
                          size="small" 
                          onClick={() => handleEditProject(project.id)}
                          aria-label="editar proyecto"
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => openDeleteDialog(project)}
                          aria-label="eliminar proyecto"
                          color="error"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          onClick={() => handleManageMembers(project.id)}
                          aria-label="gestionar miembros"
                          color="primary"
                        >
                          <GroupIcon fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      {/* Diálogo de confirmación para eliminar proyecto */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
      >
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de que deseas eliminar el proyecto "{projectToDelete?.name}"? 
            Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog}>Cancelar</Button>
          <Button onClick={handleDeleteProject} color="error" autoFocus>
            Eliminar
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default ProjectList;