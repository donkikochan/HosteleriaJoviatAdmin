import React, { useState } from 'react';
import { Box, FormControl, FormLabel, Input, Button, VStack } from '@chakra-ui/react';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import { app } from '../../firebaseConfig';

const EditStudentForm = ({ student, onClose }) => {
  const [nom, setNom] = useState(student.nom);
  const [cognom, setCognom] = useState(student.cognom);
  // Agrega más campos según necesites

  const handleSubmit = async (e) => {
    e.preventDefault();
    const db = getFirestore(app);
    const studentDocRef = doc(db, "users", student.id);

    try {
      await setDoc(studentDocRef, { nom, cognom /* Agrega más campos aquí */ }, { merge: true });
      onClose(); // Cierra el formulario o muestra un mensaje de éxito
    } catch (error) {
      console.error("Error updating student:", error);
      // Maneja los errores mostrando un mensaje al usuario
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit}>
      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Nombre</FormLabel>
          <Input value={nom} onChange={(e) => setNom(e.target.value)} />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Apellido</FormLabel>
          <Input value={cognom} onChange={(e) => setCognom(e.target.value)} />
        </FormControl>
        {/* Repite para otros campos */}
        <Button mt={4} colorScheme="blue" type="submit">Guardar Cambios</Button>
      </VStack>
    </Box>
  );
};

export default EditStudentForm;
