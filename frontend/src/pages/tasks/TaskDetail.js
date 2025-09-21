import React, { useState, useEffect, useContext } from 'react';
import { 
  Box, Typography, Paper, Chip, Button, Divider, 
  TextField, List, ListItem, ListItemText, ListItemAvatar,
  Avatar, CircularProgress, Alert, Grid, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem
} from '@mui/material';
import { 
  Edit as EditIcon, 
  Assignment as AssignmentIcon,
  Send as SendIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../contexts/AuthContext';
import Layout from '../../components/layout/Layout';

const TaskDetail = () => {
  const { projectId, taskId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  
  const [task, setTask] = useState(null);
  const [project, setProject] = useState(null);
  const [comments, setComments] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estado para comentarios
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  
  // Estado para cambio de estado
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Estado para asignación
  const [assignDialogOpen, setAssignDialogOpen] = useState(false);
  const [newAssignee, setNewAssignee] = useState('');
  const [updatingAssignee, setUpdatingAssignee] = useState(false);

  useEffect(() => {
    fetchTaskData();
  }, [projectId, taskId]);

  const fetchTaskData = async () => {
    setLoading(true);
    try {
      // Obtener datos de la tarea
      const taskResponse = await axios.get(`/api/projects/${projectId}/tasks/${taskId}`);
      setTask(taskResponse.data);
      setNewStatus(taskResponse.data.status);
      setNewAssignee(taskResponse.data.assigneeId || '');
      
      // Obtener datos del proyecto
      const projectResponse = await axios.get(`/api/projects/${projectId}`);
      setProject(projectResponse.data);
      
      // Obtener comentarios de la tarea
      const commentsResponse = await axios.get(`/api/projects/${projectId}/tasks/${taskId}/comments`);
      setComments(commentsResponse.data);
      
      // Obtener miembros del proyecto
      const membersResponse = await axios.get(`/api/projects/${projectId}/members`);
      setMembers(membersResponse.data);
      
      setError('');
    } catch (err) {
      setError('Error al cargar los datos de la tarea');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    setSubmittingComment(true);
    try {
      const response = await axios.post(`/api/projects/${projectId}/tasks/${taskId}/comments`, {
        content: newComment
      });
      
      setComments([...comments, response.data]);
      setNewComment('');
    } catch (err) {
      setError('Error al añadir el comentario');
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleOpenStatusDialog = () => {
    setNewStatus(task.status);
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    setStatusDialogOpen(false);
  };

  const handleUpdateStatus = async () => {
    setUpdatingStatus(true);
    try {
      await axios.put(`/api/projects/${projectId}/tasks/${taskId}/status`, {
        status: newStatus
      });
      
      setTask({
        ...task,
        status: newStatus
      });
      
      handleCloseStatusDialog();
    } catch (err) {
      setError('Error al actualizar el estado de la tarea');
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenAssignDialog = () => {
    setNewAssignee(task.assigneeId || '');
    setAssignDialogOpen(true);
  };

  const handleCloseAssignDialog = () => {
    setAssignDialogOpen(false);
  };

  const handleUpdateAssignee = async () => {
    setUpdatingAssignee(true);
    try {
      await axios.put(`/api/projects/${projectId}/tasks/${taskId}/assign`, {
        assigneeId: newAssignee || null
      });
      
      setTask({
        ...task,
        assigneeId: newAssignee
      });
      
      handleCloseAssignDialog();
    } catch (err) {
      setError('Error al asignar la tarea');
      console.error(err);
    } finally {
      setUpdatingAssignee(false);
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

  const getMemberName = (memberId) => {
    if (!memberId) return 'No asignado';
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

  if (!task || !project) {
    return (
      <Layout>
        <Alert severity="error">Tarea no encontrada</Alert>
        <Button 
          variant="contained" 
          onClick={() => navigate(`/projects/${projectId}/tasks`)}
          sx={{ mt: 2 }}
        >
          Volver a Tareas
        </Button>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ maxWidth: 1000, mx: 'auto', mt: 4 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {task.title}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
              Proyecto: {project.name}
            </Typography>
          </Box>
          <Box>
            <Button 
              variant="outlined" 
              onClick={() => navigate(`/projects/${projectId}/tasks`)}
              sx={{ mr: 1 }}
            >
              Volver a Tareas
            </Button>
            <Button 
              variant="contained" 
              startIcon={<EditIcon />}
              onClick={() => navigate(`/projects/${projectId}/tasks/${taskId}/edit`)}
            >
              Editar
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {/* Detalles de la tarea */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Descripción
              </Typography>
              <Typography variant="body1" paragraph>
                {task.description || 'Sin descripción'}
              </Typography>
              
              <Divider sx={{ my: 2 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Estado
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip 
                      label={task.status} 
                      color={getStatusColor(task.status)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <IconButton 
                      size="small" 
                      onClick={handleOpenStatusDialog}
                      aria-label="cambiar estado"
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Prioridad
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {task.priority}
                  </Typography>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Asignado a
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      {getMemberName(task.assigneeId)}
                    </Typography>
                    <IconButton 
                      size="small" 
                      onClick={handleOpenAssignDialog}
                      aria-label="asignar tarea"
                    >
                      <AssignmentIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Grid>
                
                <Grid item xs={6} sm={3}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Fecha límite
                  </Typography>
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No definida'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
            
            {/* Comentarios */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Comentarios
              </Typography>
              
              <List>
                {comments.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                    No hay comentarios en esta tarea.
                  </Typography>
                ) : (
                  comments.map((comment, index) => (
                    <React.Fragment key={comment.id}>
                      {index > 0 && <Divider component="li" />}
                      <ListItem alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {comment.authorName.charAt(0).toUpperCase()}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={comment.authorName}
                          secondary={
                            <>
                              <Typography
                                component="span"
                                variant="body2"
                                color="text.primary"
                                sx={{ display: 'block' }}
                              >
                                {comment.content}
                              </Typography>
                              <Typography
                                component="span"
                                variant="caption"
                                color="text.secondary"
                              >
                                {new Date(comment.createdAt).toLocaleString()}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                    </React.Fragment>
                  ))
                )}
              </List>
              
              <Divider sx={{ my: 2 }} />
              
              <Box component="form" onSubmit={handleAddComment}>
                <TextField
                  fullWidth
                  label="Añadir un comentario"
                  multiline
                  rows={3}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  disabled={submittingComment}
                  sx={{ mb: 2 }}
                />
                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendIcon />}
                    disabled={!newComment.trim() || submittingComment}
                  >
                    {submittingComment ? 'Enviando...' : 'Comentar'}
                  </Button>
                </Box>
              </Box>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            {/* Información del proyecto */}
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Información del Proyecto
              </Typography>
              <Typography variant="body2" paragraph>
                {project.description}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" color="text.secondary">
                Estado del Proyecto
              </Typography>
              <Chip 
                label={project.status} 
                color={getStatusColor(project.status)}
                size="small"
                sx={{ mt: 1 }}
              />
              <Box sx={{ mt: 2 }}>
                <Button 
                  variant="outlined" 
                  size="small"
                  onClick={() => navigate(`/projects/${projectId}`)}
                  fullWidth
                >
                  Ver Proyecto
                </Button>
              </Box>
            </Paper>
            
            {/* Miembros del proyecto */}
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Miembros del Proyecto
              </Typography>
              <List dense>
                {members.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    No hay miembros en este proyecto.
                  </Typography>
                ) : (
                  members.map((member) => (
                    <ListItem key={member.id}>
                      <ListItemAvatar>
                        <Avatar>
                          {member.username.charAt(0).toUpperCase()}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={member.username}
                        secondary={member.email}
                      />
                    </ListItem>
                  ))
                )}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Diálogo para cambiar estado */}
      <Dialog open={statusDialogOpen} onClose={handleCloseStatusDialog}>
        <DialogTitle>Cambiar Estado de la Tarea</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="new-status-label">Estado</InputLabel>
            <Select
              labelId="new-status-label"
              id="new-status"
              value={newStatus}
              label="Estado"
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <MenuItem value="Pendiente">Pendiente</MenuItem>
              <MenuItem value="En Progreso">En Progreso</MenuItem>
              <MenuItem value="Completada">Completada</MenuItem>
              <MenuItem value="Bloqueada">Bloqueada</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Cancelar</Button>
          <Button 
            onClick={handleUpdateStatus} 
            variant="contained"
            disabled={updatingStatus}
          >
            {updatingStatus ? 'Actualizando...' : 'Actualizar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para asignar tarea */}
      <Dialog open={assignDialogOpen} onClose={handleCloseAssignDialog}>
        <DialogTitle>Asignar Tarea</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="new-assignee-label">Asignar a</InputLabel>
            <Select
              labelId="new-assignee-label"
              id="new-assignee"
              value={newAssignee}
              label="Asignar a"
              onChange={(e) => setNewAssignee(e.target.value)}
            >
              <MenuItem value="">Sin asignar</MenuItem>
              {members.map(member => (
                <MenuItem key={member.id} value={member.id}>
                  {member.username}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAssignDialog}>Cancelar</Button>
          <Button 
            onClick={handleUpdateAssignee} 
            variant="contained"
            disabled={updatingAssignee}
          >
            {updatingAssignee ? 'Asignando...' : 'Asignar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default TaskDetail;