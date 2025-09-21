import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, 
  FormControl, InputLabel, Select, MenuItem, Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/layout/Layout';

const ProjectForm = () => {
  const { projectId } = useParams();
  const isEditMode = Boolean(projectId);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'Pendiente'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (isEditMode) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/projects/${projectId}`);
      const { name, description, status } = response.data;
      setFormData({ name, description, status });
    } catch (err) {
      setError('Error al cargar los datos del proyecto');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (isEditMode) {
        await axios.put(`/api/projects/${projectId}`, formData);
        setSuccess('Proyecto actualizado correctamente');
      } else {
        await axios.post('/api/projects', formData);
        setSuccess('Proyecto creado correctamente');
        setFormData({
          name: '',
          description: '',
          status: 'Pendiente'
        });
      }
      
      // Redirigir después de un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate('/projects');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el proyecto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {isEditMode ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nombre del Proyecto"
              name="name"
              autoFocus
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="description"
              label="Descripción"
              name="description"
              multiline
              rows={4}
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Estado</InputLabel>
              <Select
                labelId="status-label"
                id="status"
                name="status"
                value={formData.status}
                label="Estado"
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="Pendiente">Pendiente</MenuItem>
                <MenuItem value="En Progreso">En Progreso</MenuItem>
                <MenuItem value="Completado">Completado</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate('/projects')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
              >
                {loading ? 'Guardando...' : isEditMode ? 'Actualizar' : 'Crear'}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Layout>
  );
};

export default ProjectForm;