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

  const handleDelete = async () => {
    const db = getFirestore(app);
    try {
      await deleteDoc(doc(db, "users", selectedStudent.id));
      setIsDeleteDialogOpen(false);
      fetchStudents(); // Actualizar la lista después de eliminar
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  const openDeleteDialog = (student) => {
    setSelectedStudent(student);
    setIsDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setSelectedStudent(null);
    setIsDeleteDialogOpen(false);
  };

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
                <Button colorScheme="red" size="sm" onClick={() => openDeleteDialog(student)}>
                  <DeleteIcon />
                </Button>
                <Button colorScheme="blue" size="sm" ml={2}>
                  <EditIcon />
                </Button>
              </HStack>            
            </ListItem>
          ))}
        </List>
      </VStack>

      {/* Dialogo de confirmación de eliminación */}
      <AlertDialog isOpen={isDeleteDialogOpen} leastDestructiveRef={cancelRef} onClose={closeDeleteDialog}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirmar Eliminación
            </AlertDialogHeader>
            <AlertDialogCloseButton />
            <AlertDialogBody>
              ¿Estás seguro de que deseas eliminar a {selectedStudent && selectedStudent.nom} {selectedStudent && selectedStudent.cognom}?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={closeDeleteDialog}>
                Cancelar
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default ShowAllAlumns;
