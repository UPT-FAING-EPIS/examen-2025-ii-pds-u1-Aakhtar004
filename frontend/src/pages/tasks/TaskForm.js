import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, TextField, Button, Paper, 
  FormControl, InputLabel, Select, MenuItem, Alert,
  FormHelperText
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Layout from '../../components/layout/Layout';

const TaskForm = () => {
  const { projectId, taskId } = useParams();
  const isEditMode = Boolean(taskId);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Pendiente',
    priority: 'Media',
    dueDate: null,
    assigneeId: ''
  });
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMembers();
    if (isEditMode) {
      fetchTaskData();
    }
  }, [projectId, taskId]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get(`/api/projects/${projectId}/members`);
      setMembers(response.data);
    } catch (err) {
      console.error('Error al cargar los miembros del proyecto:', err);
    }
  };

  const fetchTaskData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/projects/${projectId}/tasks/${taskId}`);
      const { title, description, status, priority, dueDate, assigneeId } = response.data;
      setFormData({ 
        title, 
        description, 
        status, 
        priority, 
        dueDate: dueDate ? new Date(dueDate) : null, 
        assigneeId: assigneeId || '' 
      });
    } catch (err) {
      setError('Error al cargar los datos de la tarea');
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

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      dueDate: date
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const taskData = {
        ...formData,
        projectId
      };

      if (isEditMode) {
        await axios.put(`/api/projects/${projectId}/tasks/${taskId}`, taskData);
        setSuccess('Tarea actualizada correctamente');
      } else {
        await axios.post(`/api/projects/${projectId}/tasks`, taskData);
        setSuccess('Tarea creada correctamente');
        setFormData({
          title: '',
          description: '',
          status: 'Pendiente',
          priority: 'Media',
          dueDate: null,
          assigneeId: ''
        });
      }
      
      // Redirigir después de un breve retraso para mostrar el mensaje de éxito
      setTimeout(() => {
        navigate(`/projects/${projectId}/tasks`);
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar la tarea');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom>
            {isEditMode ? 'Editar Tarea' : 'Crear Nueva Tarea'}
          </Typography>
          
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Título de la Tarea"
              name="title"
              autoFocus
              value={formData.title}
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
                <MenuItem value="Completada">Completada</MenuItem>
                <MenuItem value="Bloqueada">Bloqueada</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="priority-label">Prioridad</InputLabel>
              <Select
                labelId="priority-label"
                id="priority"
                name="priority"
                value={formData.priority}
                label="Prioridad"
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="Baja">Baja</MenuItem>
                <MenuItem value="Media">Media</MenuItem>
                <MenuItem value="Alta">Alta</MenuItem>
                <MenuItem value="Urgente">Urgente</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="assignee-label">Asignar a</InputLabel>
              <Select
                labelId="assignee-label"
                id="assigneeId"
                name="assigneeId"
                value={formData.assigneeId}
                label="Asignar a"
                onChange={handleChange}
                disabled={loading}
              >
                <MenuItem value="">Sin asignar</MenuItem>
                {members.map(member => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.username}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Fecha límite"
                value={formData.dueDate}
                onChange={handleDateChange}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    fullWidth 
                    margin="normal"
                    disabled={loading}
                  />
                )}
              />
            </LocalizationProvider>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
              <Button
                variant="outlined"
                onClick={() => navigate(`/projects/${projectId}/tasks`)}
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

export default TaskForm;