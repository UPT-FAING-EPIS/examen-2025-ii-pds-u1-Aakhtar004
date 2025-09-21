import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Paper, List, ListItem, ListItemText, 
  ListItemAvatar, Avatar, ListItemSecondaryAction, IconButton,
  TextField, Button, Divider, Alert, CircularProgress
} from '@mui/material';
import { Delete as DeleteIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/layout/Layout';

const ProjectMembers = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const [project, setProject] = useState(null);
  const [members, setMembers] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      // Obtener datos del proyecto
      const projectResponse = await axios.get(`/api/projects/${projectId}`);
      setProject(projectResponse.data);
      
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

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setError('');
    setSuccess('');
    
    try {
      await axios.post(`/api/projects/${projectId}/members`, { email });
      setSuccess(`Usuario con correo ${email} añadido al proyecto`);
      setEmail('');
      fetchProjectData(); // Recargar la lista de miembros
    } catch (err) {
      setError(err.response?.data?.message || 'Error al añadir miembro');
    }
  };

  const handleRemoveMember = async (memberId) => {
    setError('');
    setSuccess('');
    
    try {
      await axios.delete(`/api/projects/${projectId}/members/${memberId}`);
      setSuccess('Miembro eliminado del proyecto');
      setMembers(members.filter(member => member.id !== memberId));
    } catch (err) {
      setError(err.response?.data?.message || 'Error al eliminar miembro');
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

  return (
    <Layout>
      <Box sx={{ maxWidth: 800, mx: 'auto', mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            Miembros del Proyecto: {project.name}
          </Typography>
          <Button 
            variant="outlined" 
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            Volver al Proyecto
          </Button>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" gutterBottom>
            Añadir Miembro
          </Typography>
          <Box component="form" onSubmit={handleAddMember} sx={{ display: 'flex', gap: 2 }}>
            <TextField
              fullWidth
              label="Correo Electrónico"
              variant="outlined"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ingrese el correo del usuario"
              size="small"
            />
            <Button 
              type="submit" 
              variant="contained" 
              startIcon={<PersonAddIcon />}
            >
              Añadir
            </Button>
          </Box>
        </Paper>

        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Miembros Actuales
          </Typography>
          
          {members.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No hay miembros en este proyecto.
            </Typography>
          ) : (
            <List>
              {members.map((member, index) => (
                <React.Fragment key={member.id}>
                  {index > 0 && <Divider component="li" />}
                  <ListItem alignItems="flex-start">
                    <ListItemAvatar>
                      <Avatar>
                        {member.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={member.username}
                      secondary={member.email}
                    />
                    {project.ownerId !== member.id && (
                      <ListItemSecondaryAction>
                        <IconButton 
                          edge="end" 
                          aria-label="delete"
                          onClick={() => handleRemoveMember(member.id)}
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    )}
                  </ListItem>
                </React.Fragment>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Layout>
  );
};

export default ProjectMembers;