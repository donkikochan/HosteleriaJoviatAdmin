import React, { useState, useEffect } from "react";
import {
  Box,
  VStack,
  Text,
  List,
  ListItem,
  Avatar,
  Button,
  HStack,
  Heading,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { app } from "../../firebaseConfig";
import { useLocation, Link } from "wouter";

const ShowAllAlumns = () => {
  const [students, setStudents] = useState([]);
  const [location, navigate] = useLocation();

  const handleEditClick = (studentId) => {
    navigate(`/edit-alumn/${studentId}`);
  };

  useEffect(() => {
    const fetchStudents = async () => {
      const db = getFirestore(app);
      const querySnapshot = await getDocs(collection(db, "users"));
      const studentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setStudents(studentsList);
    };

    fetchStudents();
  }, []);

  return (
    <Box>
      <Box position="fixed" top="80px" left="20px" zIndex="1000">
        <Link to="/home">
          <Button colorScheme="gray">
            Tornar a l'inici
          </Button>
        </Link>
      </Box>
      <Box
        mt={"10rem"}
        padding={4}
        bg="gray.50"
        maxW="3xl"
        marginX="auto"
        borderRadius="lg"
        shadow="md"
      >
        <VStack spacing={4}>
          <Heading
            as="h1"
            fontFamily="'Hanken Grotesk', Arial, sans-serif"
            size="xl"
            w={{ base: "200", md: "600" }}
            maxW={600}
            mb={5}
            textAlign={"center"}
          >
            Lista de alumnes i ex-alumnes
          </Heading>
          <List spacing={3} width="full">
            {students.map((student) => (
              <ListItem
                key={student.id}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                padding={2}
                bg="white"
                borderRadius="md"
                shadow="base"
              >
                <HStack>
                  <Avatar
                    size="md"
                    name={student.nom + " " + student.cognom}
                    src={student.imageUrl}
                    mr={4}
                  />
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">
                      {student.nom} {student.cognom}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {student.academicStatus}
                    </Text>
                  </Box>
                </HStack>
                <HStack>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    ml={2}
                    onClick={() => handleEditClick(student.id)}
                  >
                    <EditIcon />
                  </Button>
                </HStack>
              </ListItem>
            ))}
          </List>
        </VStack>
      </Box>
    </Box>
  );
};

export default ShowAllAlumns;