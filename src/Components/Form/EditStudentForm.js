import React, { useState, useEffect, useRef } from "react";
import { useRoute, useLocation } from "wouter";
import {
  Box,
  FormControl,
  FormLabel,
  Input,
  Button,
  VStack,
  Select,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { doc, getFirestore, getDoc, setDoc } from "firebase/firestore";
import { app } from "../../firebaseConfig";

const EditStudentForm = () => {
  const [, params] = useRoute("/edit-alumn/:id");
  const studentId = params.id;
  const [location, navigate] = useLocation();
  const toast = useToast();
  const [nom, setNom] = useState("");
  const [cognom, setCognom] = useState("");
  const [academicStatus, setAcademicStatus] = useState("");
  const [birth, setBirth] = useState("");
  const [username, setUsername] = useState("");
  const [linkedin, setLinkedin] = useState("");
  const [instagram, setInstagram] = useState("");
  const [mobile, setMobile] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const onClose = () => setIsOpen(false);
  const cancelRef = useRef();

  useEffect(() => {
    const db = getFirestore(app);
    const studentDocRef = doc(db, "users", studentId);
    getDoc(studentDocRef)
      .then((docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNom(data.nom || "");
          setCognom(data.cognom || "");
          setAcademicStatus(data.academicStatus || "");
          setBirth(data.birth || "");
          setUsername(data.username || "");
          setLinkedin(data.linkedin || "");  
          setInstagram(data.instagram || "");  
          setMobile(data.mobile || "");  
        } else {
          toast({
            title: "Error",
            description: "No s'ha trobat l'alumne.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });
        }
      })
      .catch((error) => {
        console.error("Error carregant dades de l'alumne:", error);
        toast({
          title: "Error",
          description: "Error en carregar les dades de l'alumne.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      });
  }, [studentId, toast]);

  const handleUpdate = async () => {
    const db = getFirestore(app);
    const studentDocRef = doc(db, "users", studentId);

    try {
      await setDoc(
        studentDocRef,
        { nom, cognom, academicStatus, birth, username, linkedin, instagram, mobile },
        { merge: true }
      );
      toast({
        title: "Alumne Actualitzat",
        description: "Les dades de l'alumne han estat actualitzades amb èxit.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      navigate("/veure-alumnes"); // Redirect to ShowAllAlumns
    } catch (error) {
      console.error("Error actualitzant l'alumne:", error);
      toast({
        title: "Error",
        description: "No s'ha pogut actualitzar l'alumne.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOpen(true); // Show confirmation dialog
  };

  return (
    <Box>
      <VStack bg={"white"} width={"100%"} pt={150}>
        <FormLabel
          as="h1"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          fontSize="4xl"
          w={{ base: "90%", md: "600px" }}
          maxW={600}
          mb={5}
          textAlign={"center"}
        >
          ¡Editeu les dades dels alumnes!
        </FormLabel>
      </VStack>
      <VStack as="form" onSubmit={handleSubmit}>
        <FormControl mt={50} maxW={600} isRequired>
          <FormLabel mt={5}>Nom</FormLabel>
          <Input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            placeholder="Nom"
          />
          <FormLabel mt={5}>Cognom</FormLabel>
          <Input
            type="text"
            value={cognom}
            onChange={(e) => setCognom(e.target.value)}
            placeholder="Cognom"
          />
          <FormLabel mt={5}>Estat acadèmic</FormLabel>
          <Select
            value={academicStatus}
            onChange={(e) => setAcademicStatus(e.target.value)}
          >
            <option value="">Selecciona una opció</option>
            <option value="Alumn">Alumne</option>
            <option value="Ex-alumn">Ex-alumne</option>
          </Select>
          <FormLabel mt={5}>Data de naixement</FormLabel>
          <Input
            type="date"
            value={birth}
            onChange={(e) => setBirth(e.target.value)}
            placeholder="Data de naixement"
          />
          <FormLabel mt={5}>Nom d'usuari</FormLabel>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nom d'usuari"
          />
          <FormLabel mt={5}>LinkedIn</FormLabel>
          <Input
            type="text"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="LinkedIn"
          />
          <FormLabel mt={5}>Instagram</FormLabel>
          <Input
            type="text"
            value={instagram}
            onChange={(e) => setInstagram(e.target.value)}
            placeholder="Instagram"
          />
          <FormLabel mt={5}>Móvil</FormLabel>
          <Input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Móvil"
          />
          <Button mt={5} mb={20} colorScheme="blue" type="submit">
            Guardar Canvis
          </Button>
        </FormControl>
      </VStack>
      {/* Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirmar Actualització
            </AlertDialogHeader>
            <AlertDialogBody>
              Esteu segur que voleu guardar els canvis?
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel·lar
              </Button>
              <Button colorScheme="blue" onClick={handleUpdate} ml={3}>
                Guardar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default EditStudentForm;
