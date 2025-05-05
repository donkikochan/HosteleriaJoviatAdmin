"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  VStack,
  Text,
  List,
  ListItem,
  Button,
  HStack,
  Image,
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
  WrapItem,
} from "@chakra-ui/react"
import { EditIcon, SearchIcon, ViewIcon, DeleteIcon } from "@chakra-ui/icons"
import { getFirestore, collection, getDocs, doc, deleteDoc, getDoc } from "firebase/firestore"
import { app } from "../../firebaseConfig"
import { useLocation } from "wouter"
import Sidebar from "../Sidebar" // Import the Sidebar component

const ShowAllRestaurants = () => {
  const [restaurants, setRestaurants] = useState([])
  const [filteredRestaurants, setFilteredRestaurants] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRestaurant, setSelectedRestaurant] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [location, navigate] = useLocation()
  const [alumnes, setAlumnes] = useState({})
  const [loadingAlumnes, setLoadingAlumnes] = useState(false)

  // Para el diálogo de confirmación de eliminación
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [restaurantToDelete, setRestaurantToDelete] = useState(null)
  const cancelRef = useRef()
  const toast = useToast()

  const handleEditClick = (restaurantId) => {
    navigate(`/edit-restaurant/${restaurantId}`)
  }

  const handleViewClick = async (restaurant) => {
    setSelectedRestaurant(restaurant)

    // Cargar los alumnos del restaurante si aún no se han cargado
    if (restaurant.id && !alumnes[restaurant.id]) {
      await fetchAlumnesForRestaurant(restaurant.id)
    }

    onOpen()
  }

  // Función para abrir el diálogo de confirmación de eliminación
  const handleDeleteClick = (restaurant, e) => {
    e.stopPropagation() // Evitar que se propague al elemento padre
    setRestaurantToDelete(restaurant)
    setIsDeleteDialogOpen(true)
  }

  // Función para confirmar la eliminación
  const confirmDelete = async () => {
    if (!restaurantToDelete) return

    try {
      const db = getFirestore(app)

      // Primero eliminamos la subcolección "alumnes" del restaurante
      const alumnesCollection = collection(db, "Restaurant", restaurantToDelete.id, "alumnes")
      const alumnesSnapshot = await getDocs(alumnesCollection)

      // Crear un array de promesas para eliminar todos los documentos de la subcolección
      const deletePromises = alumnesSnapshot.docs.map((alumneDoc) =>
        deleteDoc(doc(db, "Restaurant", restaurantToDelete.id, "alumnes", alumneDoc.id)),
      )

      // Esperar a que se completen todas las eliminaciones de la subcolección
      await Promise.all(deletePromises)

      // Después eliminamos el documento principal del restaurante
      await deleteDoc(doc(db, "Restaurant", restaurantToDelete.id))

      // Actualizar la lista de restaurantes
      setRestaurants(restaurants.filter((restaurant) => restaurant.id !== restaurantToDelete.id))
      setFilteredRestaurants(filteredRestaurants.filter((restaurant) => restaurant.id !== restaurantToDelete.id))

      toast({
        title: "Restaurant eliminat",
        description: `S'ha eliminat correctament el restaurant i tots els seus alumnes associats`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "No s'ha pogut eliminar el restaurant. Intenta-ho de nou.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      console.error("Error al eliminar el restaurant:", error)
    }

    setIsDeleteDialogOpen(false)
    setRestaurantToDelete(null)
  }

  // Función para obtener los alumnos de un restaurante
  const fetchAlumnesForRestaurant = async (restaurantId) => {
    setLoadingAlumnes(true)
    try {
      const db = getFirestore(app)
      const alumnesCollection = collection(db, "Restaurant", restaurantId, "alumnes")
      const alumnesSnapshot = await getDocs(alumnesCollection)

      const restaurantAlumnes = []

      // Para cada alumno en la subcolección, obtener sus datos completos
      for (const alumneDoc of alumnesSnapshot.docs) {
        const alumneData = alumneDoc.data()

        if (alumneData.userId) {
          // Obtener los datos completos del usuario
          const userDoc = await getDoc(doc(db, "users", alumneData.userId))

          if (userDoc.exists()) {
            const userData = userDoc.data()
            restaurantAlumnes.push({
              id: alumneData.userId,
              nom: userData.nom,
              cognom: userData.cognom,
              propietari: alumneData.propietari || false,
            })
          }
        }
      }

      // Actualizar el estado con los alumnos del restaurante
      setAlumnes((prev) => ({
        ...prev,
        [restaurantId]: restaurantAlumnes,
      }))
    } catch (error) {
      console.error("Error al obtener los alumnos del restaurante:", error)
    } finally {
      setLoadingAlumnes(false)
    }
  }

  useEffect(() => {
    const fetchRestaurants = async () => {
      const db = getFirestore(app)
      const querySnapshot = await getDocs(collection(db, "Restaurant"))
      const restaurantsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      // Ordenar alfabéticamente por nombre
      const sortedRestaurants = restaurantsList.sort((a, b) => {
        const nameA = a.nom.toLowerCase()
        const nameB = b.nom.toLowerCase()
        return nameA.localeCompare(nameB)
      })

      setRestaurants(sortedRestaurants)
      setFilteredRestaurants(sortedRestaurants)
    }

    fetchRestaurants()
  }, [])

  // Función para manejar la búsqueda
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase()
    setSearchTerm(searchValue)

    if (searchValue === "") {
      setFilteredRestaurants(restaurants)
    } else {
      const filtered = restaurants.filter((restaurant) => {
        const name = restaurant.nom.toLowerCase()
        const address = restaurant.direccio ? restaurant.direccio.toLowerCase() : ""
        return name.includes(searchValue) || address.includes(searchValue)
      })
      setFilteredRestaurants(filtered)
    }
  }

  // Modal para mostrar los detalles del restaurante
  const RestaurantDetailsModal = () => {
    if (!selectedRestaurant) return null

    const restaurantAlumnes = alumnes[selectedRestaurant.id] || []
    const propietarios = restaurantAlumnes.filter((alumne) => alumne.propietari)

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            <HStack>
              <Image
                boxSize="50px"
                borderRadius="md"
                src={
                  selectedRestaurant.foto && selectedRestaurant.foto.length > 0
                    ? selectedRestaurant.foto[0]
                    : "/placeholder.svg"
                }
                alt={selectedRestaurant.nom}
              />
              <Text>{selectedRestaurant.nom}</Text>
            </HStack>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Grid templateColumns="repeat(2, 1fr)" gap={4}>
              <GridItem colSpan={2}>
                <Image
                  w="100%"
                  h="200px"
                  objectFit="cover"
                  borderRadius="md"
                  src={
                    selectedRestaurant.foto && selectedRestaurant.foto.length > 0
                      ? selectedRestaurant.foto[0]
                      : "/placeholder.svg"
                  }
                  alt={selectedRestaurant.nom}
                />
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Direcció:</Text>
                <Text>{selectedRestaurant.direccio || "No especificada"}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Telèfon:</Text>
                <Text>{selectedRestaurant.telefon || "No especificat"}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Correu electrònic:</Text>
                <Text>{selectedRestaurant.email || "No especificat"}</Text>
              </GridItem>
              <GridItem>
                <Text fontWeight="bold">Pàgina web:</Text>
                {selectedRestaurant.web ? (
                  <Link href={selectedRestaurant.web} isExternal color="blue.500">
                    {selectedRestaurant.web}
                  </Link>
                ) : (
                  <Text>No especificada</Text>
                )}
              </GridItem>
              <GridItem colSpan={2}>
                <Text fontWeight="bold">Descripció:</Text>
                <Text>{selectedRestaurant.descripcio || "No hi ha descripció disponible"}</Text>
              </GridItem>
              <GridItem colSpan={2}>
                <Text fontWeight="bold" mb={2}>
                  Propietaris:
                </Text>
                {loadingAlumnes ? (
                  <Text>Carregant alumnes...</Text>
                ) : propietarios.length > 0 ? (
                  <Wrap spacing={2}>
                    {propietarios.map((alumne) => (
                      <WrapItem key={alumne.id}>
                        <Tag size="md" colorScheme="blue" borderRadius="full">
                          {alumne.nom} {alumne.cognom}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                ) : (
                  <Text>No hi ha propietaris assignats</Text>
                )}
              </GridItem>
              <GridItem colSpan={2}>
                <Text fontWeight="bold" mb={2}>
                  Treballadors:
                </Text>
                {loadingAlumnes ? (
                  <Text>Carregant alumnes...</Text>
                ) : restaurantAlumnes.filter((alumne) => !alumne.propietari).length > 0 ? (
                  <Wrap spacing={2}>
                    {restaurantAlumnes
                      .filter((alumne) => !alumne.propietari)
                      .map((alumne) => (
                        <WrapItem key={alumne.id}>
                          <Tag size="md" colorScheme="green" borderRadius="full">
                            {alumne.nom} {alumne.cognom}
                          </Tag>
                        </WrapItem>
                      ))}
                  </Wrap>
                ) : (
                  <Text>No hi ha treballadors assignats</Text>
                )}
              </GridItem>
            </Grid>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Tancar
            </Button>
            <Button colorScheme="green" onClick={() => handleEditClick(selectedRestaurant.id)}>
              Editar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
  }

  // Diálogo de confirmación para eliminar un restaurante
  const DeleteConfirmationDialog = () => (
    <AlertDialog
      isOpen={isDeleteDialogOpen}
      leastDestructiveRef={cancelRef}
      onClose={() => setIsDeleteDialogOpen(false)}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Eliminar Restaurant
          </AlertDialogHeader>

          <AlertDialogBody>
            Estàs segur que vols eliminar el restaurant {restaurantToDelete?.nom}? Aquesta acció no es pot desfer.
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
            Llista de Restaurants
          </Heading>

          <InputGroup maxW="md">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input placeholder="Buscar restaurant..." value={searchTerm} onChange={handleSearch} />
          </InputGroup>

          <List spacing={3} width="full">
            {filteredRestaurants.map((restaurant) => (
              <ListItem
                key={restaurant.id}
                onClick={() => handleViewClick(restaurant)}
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
                  <Image
                    width={"100px"}
                    height={"70px"}
                    objectFit="cover"
                    src={restaurant.foto && restaurant.foto.length > 0 ? restaurant.foto[0] : "/placeholder.svg"}
                    borderRadius={10}
                  />
                  <Box>
                    <Text fontWeight="bold" fontSize="lg">
                      {restaurant.nom}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      {restaurant.direccio || "No especificada"}
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
                      handleViewClick(restaurant)
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
                      handleEditClick(restaurant.id)
                    }}
                  >
                    Editar
                  </Button>
                  <Button
                    colorScheme="red"
                    size="sm"
                    leftIcon={<DeleteIcon />}
                    onClick={(e) => handleDeleteClick(restaurant, e)}
                  >
                    Eliminar
                  </Button>
                </HStack>
              </ListItem>
            ))}
          </List>
        </VStack>
      </Box>

      <RestaurantDetailsModal />
      <DeleteConfirmationDialog />
    </Box>
  )

  // Wrap the content with the Sidebar component
  return <Sidebar>{content}</Sidebar>
}

export default ShowAllRestaurants
