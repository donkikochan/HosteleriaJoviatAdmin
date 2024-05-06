import React, { useEffect, useState, useRef } from "react";
import { Box, VStack, Text, List, ListItem, Avatar, useColorModeValue, Button, HStack, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay, AlertDialogCloseButton } from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { app } from "../../firebaseConfig";

const ShowAllAlumns = () => {
  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = useRef();
  const bgColor = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "gray.200");

  const fetchStudents = async () => {
    const db = getFirestore(app);
    const querySnapshot = await getDocs(collection(db, "users"));
    const studentsList = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setStudents(studentsList);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Función para manejar la eliminación del alumno (actualmente deshabilitado)
  /* const handleDelete = async () => {
    try {
      // Eliminar el estudiante de Firestore
      await deleteStudentFromFirestore(selectedStudent.id);

      // Llamar a la Cloud Function para eliminar la autenticación del estudiante
      await deleteStudentAndAuth(selectedStudent.id);

      // Cerrar el diálogo y actualizar la lista de estudiantes
      setIsDeleteDialogOpen(false);
      fetchStudents(); // Actualizar la lista después de eliminar
    } catch (error) {
      console.error("Error deleting student and auth:", error);
    }
  };

  // Función para eliminar un estudiante de Firestore (actualmente deshabilitado)
  const deleteStudentFromFirestore = async (studentId) => {
    const db = getFirestore(app);
    await deleteDoc(doc(db, "users", studentId));
  };

  // Función para manejar la eliminación de la autenticación del alumno (parte de backend) (actualmente deshabilitado)
  const deleteStudentAndAuth = async (studentId) => {
    await fetch(`/deleteStudentAndAuth/${studentId}`);
  };

  // Función para abrir el diálogo de confirmación de eliminación (actualmente deshabilitado)
  const openDeleteDialog = (student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  // Función para cerrar el diálogo de confirmación de eliminación (actualmente deshabilitado)
  const closeDeleteDialog = () => {
    setSelectedStudent(null);
    setIsDeleteDialogOpen(false);
  }; */

  return (
    <Box mt={"10rem"} padding={4} bg={bgColor} maxW="3xl" marginX="auto" borderRadius="lg" shadow="md">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold" color={textColor}>Llista Alumnes/Ex-Alumnes</Text>
        <List spacing={3} width="full">
          {students.map(student => (
            <ListItem key={student.id} display="flex" alignItems="center" justifyContent="space-between" padding={2} bg="white" borderRadius="md" shadow="base">
               <HStack>
                <Avatar size="md" name={student.nom + ' ' + student.cognom} src={student.imageUrl} mr={4} />
                <Box>
                  <Text fontWeight="bold" fontSize="lg">{student.nom} {student.cognom}</Text>
                  <Text fontSize="sm" color="gray.500">{student.academicStatus}</Text>
                </Box>
              </HStack>
              <HStack>
                {/* Botón para abrir el diálogo de eliminación (actualmente deshabilitado)
                <Button colorScheme="red" size="sm" onClick={() => openDeleteDialog(student)}>
                  <DeleteIcon />
                </Button> */}
                <Button colorScheme="blue" size="sm" ml={2}>
                  <EditIcon />
                </Button>
              </HStack>            
            </ListItem>
          ))}
        </List>
      </VStack>
    </Box>
  );
};

export default ShowAllAlumns;
