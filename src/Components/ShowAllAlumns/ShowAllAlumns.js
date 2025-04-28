import { useState, useEffect, useRef } from "react"
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
  Input,
  InputGroup,
  InputLeftElement,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Grid,
  GridItem,
  Link,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useToast
} from "@chakra-ui/react"
import { EditIcon, SearchIcon, ViewIcon, DeleteIcon } from "@chakra-ui/icons"
import { getFirestore, collection, getDocs, doc, deleteDoc } from "firebase/firestore"
import { app } from "../../firebaseConfig"
import { useLocation } from "wouter"
import Sidebar from "../Sidebar" // Import the Sidebar component

const ShowAllAlumns = () => {
  const [students, setStudents] = useState([])
  const [filteredStudents, setFilteredStudents] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStudent, setSelectedStudent] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [location, navigate] = useLocation()
  
  // Para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const cancelRef = useRef()
  const toast = useToast()

  const handleEditClick = (studentId) => {
    navigate(`/edit-alumn/${studentId}`)
  }
  
  const handleViewClick = (student) => {
    setSelectedStudent(student)
    onOpen()
  }
  
  // Función para abrir el diálogo de confirmación de eliminación
  const handleDeleteClick = (student, e) => {
    e.stopPropagation() // Evitar que se propague al elemento padre
    setStudentToDelete(student)
    setIsDeleteDialogOpen(true)
  }
  
  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    if (!studentToDelete) return
    
    try {
      const db = getFirestore(app)
      await deleteDoc(doc(db, "users", studentToDelete.id))
      
      // Actualizar la lista de estudiantes
      setStudents(students.filter(student => student.id !== studentToDelete.id))
      setFilteredStudents(filteredStudents.filter(student => student.id !== studentToDelete.id))
      
      toast({
        title: "Alumne eliminat",
        description: `S'ha eliminat correctament l'usuari`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No s'ha pogut eliminar l'alumne. Intenta-ho de nou.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      console.error("Error al eliminar el alumno:", error)
    }
    
    setIsDeleteDialogOpen(false)
    setStudentToDelete(null)
  }

  useEffect(() => {
    const fetchStudents = async () => {
      const db = getFirestore(app)
      const querySnapshot = await getDocs(collection(db, "users"))
      const studentsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      
      // Ordenar alfabéticamente por nombre
      const sortedStudents = studentsList.sort((a, b) => {
        const nameA = `${a.nom} ${a.cognom}`.toLowerCase()
        const nameB = `${b.nom} ${b.cognom}`.toLowerCase()
        return nameA.localeCompare(nameB)
      })
      
      setStudents(sortedStudents)
      setFilteredStudents(sortedStudents)
    }

    fetchStudents()
  }, [])
  
  // Función para manejar la búsqueda
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase()
    setSearchTerm(searchValue)
    
    if (searchValue === "") {
      setFilteredStudents(students)
    } else {
      const filtered = students.filter(student => {
        const fullName = `${student.nom} ${student.cognom}`.toLowerCase()
        return fullName.includes(searchValue)
      })
      setFilteredStudents(filtered)
    }
  }

  // Modal para mostrar los detalles del alumno
  const StudentDetailsModal = () => {
    if (!selectedStudent) return null
    
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Avatar size="md" name={selectedStudent.nom + " " + selectedStudent.cognom} src={selectedStudent.imageUrl} />
              <Text>{selectedStudent.nom} {selectedStudent.cognom}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem>
                <Text fontWeight="bold">Estat acadèmic:</Text>
                <Text>{selectedStudent.academicStatus || "No especificat"}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Data de naixement:</Text>
                <Text>{selectedStudent.birth || "No especificada"}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Nom d'usuari:</Text>
                <Text>{selectedStudent.username || "No especificat"}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Correu electrònic:</Text>
                <Text>{selectedStudent.email || "No especificat"}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Mòbil:</Text>
                <Text>{selectedStudent.mobile || "No especificat"}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">LinkedIn:</Text>
                {selectedStudent.linkedin ? (
                  <Link href={`https://linkedin.com/in/${selectedStudent.linkedin}`} isExternal color="blue.500">
                    {selectedStudent.linkedin}
                  </Link>
                ) : (
                  <Text>No especificat</Text>
                )}
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Instagram:</Text>
                {selectedStudent.instagram ? (
                  <Link href={`https://instagram.com/${selectedStudent.instagram}`} isExternal color="blue.500">
                    @{selectedStudent.instagram}
                  </Link>
                ) : (
                  <Text>No especificat</Text>
                )}
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={() => handleEditClick(selectedStudent.id)}>
              Editar
            </Button>
            <Button colorScheme="red" mr={3} onClick={(e) => handleDeleteClick(selectedStudent, e)}>
              Eliminar
            </Button>
            <Button variant="ghost" onClick={onClose}>Tancar</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  // The content that will be wrapped by the Sidebar
  const content = (
    <Box>
      <Box mt={"10rem"} padding={4} bg="gray.50" maxW="3xl" marginX="auto" borderRadius="lg" shadow="md">
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
            Llista d'alumnes i ex-alumnes
          </Heading>
          
          {/* Campo de búsqueda */}
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Buscar alumne..." 
              value={searchTerm}
              onChange={handleSearch}
              bg="white"
              mb={4}
            />
          </InputGroup>
          
          <List spacing={3} width="full">
            {filteredStudents.map((student) => (
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
                  <Avatar size="md" name={student.nom + " " + student.cognom} src={student.imageUrl} mr={4} />
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
                    colorScheme="teal" 
                    size="sm" 
                    leftIcon={<ViewIcon />} 
                    onClick={() => handleViewClick(student)}
                  >
                    Veure dades
                  </Button>
                  <Button 
                    colorScheme="blue" 
                    size="sm" 
                    ml={2} 
                    onClick={() => handleEditClick(student.id)}
                  >
                    <EditIcon />
                  </Button>
                  <Button 
                    colorScheme="red" 
                    size="sm" 
                    ml={2} 
                    onClick={(e) => handleDeleteClick(student, e)}
                  >
                    <DeleteIcon />
                  </Button>
                </HStack>
              </ListItem>
            ))}
          </List>
          
          {/* Mensaje cuando no hay resultados */}
          {filteredStudents.length === 0 && (
            <Text color="gray.500" textAlign="center" py={4}>
              No hi ha cap alumne que coincideixi amb la cerca.
            </Text>
          )}
        </VStack>
      </Box>
      
      {/* Modal para mostrar detalles del alumno */}
      <StudentDetailsModal />
      
      {/* Diálogo de confirmación para eliminar alumno */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Eliminar alumne
            </AlertDialogHeader>

            <AlertDialogBody>
              {studentToDelete && (
                <>
                  Estàs segur que vols eliminar aquest usuari?
                  <br />
                  Aquesta acció no es pot desfer.
                </>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel·lar
              </Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                Eliminar
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )

  // Wrap the content with the Sidebar component
  return <Sidebar>{content}</Sidebar>
}

export default ShowAllAlumns