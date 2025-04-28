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
  useToast,
  Tag,
  Wrap,
  WrapItem
} from "@chakra-ui/react"
import { EditIcon, SearchIcon, ViewIcon, DeleteIcon } from "@chakra-ui/icons"
import { getFirestore, collection, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore"
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
  const [restaurants, setRestaurants] = useState({})
  const [loadingRestaurants, setLoadingRestaurants] = useState(false)
  
  // Para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [studentToDelete, setStudentToDelete] = useState(null)
  const cancelRef = useRef()
  const toast = useToast()

  const handleEditClick = (studentId) => {
    navigate(`/edit-alumn/${studentId}`)
  }
  
  const handleViewClick = async (student) => {
    setSelectedStudent(student)
    
    // Cargar los restaurantes del usuario si aún no se han cargado
    if (student.id && !restaurants[student.id]) {
      await fetchRestaurantsForUser(student.id)
    }
    
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

  // Función para obtener los restaurantes de un usuario
  const fetchRestaurantsForUser = async (userId) => {
    setLoadingRestaurants(true)
    try {
      const db = getFirestore(app)
      const restaurantsCollection = collection(db, "Restaurant")
      const restaurantsSnapshot = await getDocs(restaurantsCollection)
      
      const userRestaurants = []
      
      // Para cada restaurante, verificar si el usuario está en la subcolección "alumnes"
      for (const restaurantDoc of restaurantsSnapshot.docs) {
        const restaurantId = restaurantDoc.id
        const restaurantData = restaurantDoc.data()
        
        // Obtener la subcolección "alumnes" del restaurante
        const alumnesCollection = collection(db, "Restaurant", restaurantId, "alumnes")
        const alumnesSnapshot = await getDocs(alumnesCollection)
        
        // Verificar si el usuario está en la subcolección y es propietario
        const userAlumne = alumnesSnapshot.docs.find(doc => {
          const alumneData = doc.data()
          return alumneData.userId === userId && alumneData.propietari === true
        })
        
        if (userAlumne) {
          userRestaurants.push({
            id: restaurantId,
            nom: restaurantData.nom,
            direccio: restaurantData.direccio,
            propietari: true
          })
        }
      }
      
      // Actualizar el estado con los restaurantes del usuario
      setRestaurants(prev => ({
        ...prev,
        [userId]: userRestaurants
      }))
    } catch (error) {
      console.error("Error al obtener los restaurantes del usuario:", error)
    } finally {
      setLoadingRestaurants(false)
    }
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
    
    const userRestaurants = restaurants[selectedStudent.id] || []
    
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
              <GridItem colSpan={2}>
                <Text fontWeight="bold" mb={2}>Restaurants (Propietari):</Text>
                {loadingRestaurants ? (
                  <Text>Cargando restaurantes...</Text>
                ) : userRestaurants.length > 0 ? (
                  <Wrap spacing={2}>
                    {userRestaurants.map(restaurant => (
                      <WrapItem key={restaurant.id}>
                        <Tag size="md" colorScheme="blue" borderRadius="full">
                          {restaurant.nom}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                ) : (
                  <Text>No es propietari de cap restaurant</Text>
                )}
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Tancar
            </Button>
            <Button colorScheme="green" onClick={() => handleEditClick(selectedStudent.id)}>
              Editar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  // Diálogo de confirmación para eliminar un alumno
  const DeleteConfirmationDialog = () => (
    <AlertDialog
      isOpen={isDeleteDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => setIsDeleteDialogOpen(false)}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Eliminar Alumne
          </AlertDialogHeader>

          <AlertDialogBody>
            Estàs segur que vols eliminar a {studentToDelete?.nom} {studentToDelete?.cognom}? Aquesta acció no es pot desfer.
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
  )

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
            Llista d'Alumnes
          </Heading>
          
          <InputGroup maxW="md">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input 
              placeholder="Buscar alumne..." 
              value={searchTerm}
              onChange={handleSearch}
            />
          </InputGroup>
          
          <List spacing={3} width="full">
            {filteredStudents.map((student) => (
              <ListItem
                key={student.id}
                onClick={() => handleViewClick(student)}
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                padding={4}
                bg="white"
                borderRadius="md"
                shadow="base"
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
              >
                <HStack>
                  <Avatar name={student.nom + " " + student.cognom} src={student.imageUrl} />
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">
                      {student.nom} {student.cognom}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {student.academicStatus || "No especificat"}
                    </Text>
                  </Box>
                </HStack>
                <HStack>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    leftIcon={<ViewIcon />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleViewClick(student)
                    }}
                  >
                    Veure
                  </Button>
                  <Button
                    colorScheme="green"
                    size="sm"
                    leftIcon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditClick(student.id)
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    leftIcon={<DeleteIcon />}
                    onClick={(e) => handleDeleteClick(student, e)}
                  >
                    Eliminar
                  </Button>
                </HStack>
              </ListItem>
            ))}
          </List>
        </VStack>
      </Box>
      
      <StudentDetailsModal />
      <DeleteConfirmationDialog />
    </Box>
  )

  // Wrap the content with the Sidebar component
  return <Sidebar>{content}</Sidebar>
}

export default ShowAllAlumns