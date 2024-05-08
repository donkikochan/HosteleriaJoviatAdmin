import React, { useState, useEffect } from 'react';
import {
  Box, VStack, Text, List, ListItem, Avatar, Button, HStack
} from '@chakra-ui/react';
import { EditIcon } from '@chakra-ui/icons';
// Import correcto del EditStudentForm si decides usarlo en un modal
//import EditStudentForm from '../Form/EditStudentForm';  
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import { useLocation } from 'wouter'; // Importación correcta del useLocation de wouter

const ShowAllAlumns = () => {
  const [students, setStudents] = useState([]);
  // La siguiente línea no es necesaria si usas navegación en lugar de modal
  //const [selectedStudent, setSelectedStudent] = useState(null);
  //const { isOpen, onOpen, onClose } = useDisclosure();
  const [location, navigate] = useLocation(); // Uso correcto de useLocation para obtener navigate

  const handleEditClick = (studentId) => {
    navigate(`/edit-alumn/${studentId}`);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      const db = getFirestore(app);
      const querySnapshot = await getDocs(collection(db, "users"));
      const studentsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsList);
    };

    fetchStudents();
  }, []);

  return (
    <Box mt={"10rem"} padding={4} bg="gray.50" maxW="3xl" marginX="auto" borderRadius="lg" shadow="md">
      <VStack spacing={4}>
        <Text fontSize="2xl" fontWeight="bold">Lista Alumnos/Ex-Alumnos</Text>
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
                <Button colorScheme="blue" size="sm" ml={2} onClick={() => handleEditClick(student.id)}>
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
