"use client"

import { useState, useEffect, useRef } from "react"
import {
  FormControl,
  FormLabel,
  FormHelperText,
  Input,
  Button,
  VStack,
  Box,
  Heading,
  Select,
  Checkbox,
  Tabs,
  Tab,
  TabList,
  TabPanels,
  TabPanel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Avatar,
  Flex,
  Stack,
  InputGroup,
  InputLeftElement,
  Text,
  Spinner,
  Badge,
  Image,
} from "@chakra-ui/react"
import { useLocation } from "wouter"
import { AddIcon, DeleteIcon, SearchIcon, CloseIcon } from "@chakra-ui/icons"

import { getFirestore, setDoc, doc, collection, getDocs, getDoc } from "@firebase/firestore"
import { app } from "../../firebaseConfig"
import { searchPlaces, getPlaceDetails } from "../../utils/googlePlaceService"
import Sidebar from "../Sidebar" // Import the Sidebar component with the correct path

const RestaurantsForm = () => {
  const [nom, setNom] = useState("")
  const [tel, setTel] = useState("")
  const [web, setWeb] = useState("")
  const [longitud, setLongitud] = useState("")
  const [latitud, setLatitud] = useState("")
  const [instagram, setInstagram] = useState("")
  const [foto, setFotos] = useState([""])
  const [direccio, setDireccio] = useState("")
  // Removed descripcio state
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [responsabilitat, setResponsabilitat] = useState("")
  const [propietari, setPropietari] = useState(false)
  const [anydeinici, setAnydeinici] = useState("")
  const [userInstagram, setUserInstagram] = useState("")
  const [linkedin, setLinkedin] = useState("")
  const [mobil, setMobil] = useState("")
  const [touchedFields, setTouchedFields] = useState({
    nom: false,
    tel: false,
    web: false,
    longitud: false,
    latitud: false,
    instagram: false,
    foto: false,
    direccio: false,
    selectedUser: false,
    responsabilitat: false,
    propietari: false,
    anydeinici: false,
  })
  const [location, navigate] = useLocation()
  const [searchTerm, setSearchTerm] = useState("")
  const [newUsersCount, setNewUsersCount] = useState(0)
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Google Places integration states
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [placeDetails, setPlaceDetails] = useState(null)
  const [mapUrl, setMapUrl] = useState("")
  const mapRef = useRef(null)
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const fetchUsers = async () => {
      const db = getFirestore(app)
      const querySnapshot = await getDocs(collection(db, "users"))
      const usersData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      setUsers(usersData)
    }

    fetchUsers()
  }, [])

  // Update map when coordinates change
  useEffect(() => {
    if (latitud && longitud) {
      updateMapUrl(latitud, longitud)
      setShowMap(true)
    }
  }, [latitud, longitud])

  const updateMapUrl = (lat, lng) => {
    // Validate the coordinates
    if (!lat || !lng || isNaN(Number.parseFloat(lat)) || isNaN(Number.parseFloat(lng))) {
      console.error("Invalid coordinates:", lat, lng)
      setShowMap(false)
      return
    }

    // Create Google Maps static image URL
    const zoom = 15
    const size = "600x300"
    const mapType = "roadmap"
    const marker = `markers=color:red%7C${lat},${lng}`

    // Replace this with your actual API key
    const apiKey = "YOUR_GOOGLE_MAPS_API_KEY"

    const url = `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=${size}&maptype=${mapType}&${marker}&key=${apiKey}`

    console.log("Map URL generated:", url)
    setMapUrl(url)
    setShowMap(true)
  }

  const handleSearchInputChange = (e) => {
    const value = e.target.value
    setSearchValue(value)

    // Debounce search to avoid too many API calls
    if (value.trim()) {
      setIsSearching(true)
      const timeoutId = setTimeout(() => {
        handlePlaceSearch(value)
      }, 500)

      return () => clearTimeout(timeoutId)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }

  const handlePlaceSearch = async (searchValue) => {
    if (!searchValue.trim()) {
      setSearchResults([])
      return
    }

    try {
      setIsSearching(true)
      const results = await searchPlaces(searchValue)
      setSearchResults(results)
    } catch (error) {
      console.error("Error searching places:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const handlePlaceSelection = async (placeId) => {
    try {
      setIsSearching(true)
      const details = await getPlaceDetails(placeId)
      const place = details.result
      console.log("Datos completos del lugar:", place)
      setPlaceDetails(place)

      // Update form fields with place details
      setNom(place.name || "")
      setTel(place.formatted_phone_number || "")
      setWeb(place.website || "")
      setDireccio(place.formatted_address || "")

      // Set coordinates if available
      if (place.geometry && place.geometry.location) {
        // Ensure we get the values regardless of the format
        const lat =
          typeof place.geometry.location.lat === "function"
            ? place.geometry.location.lat()
            : place.geometry.location.lat

        const lng =
          typeof place.geometry.location.lng === "function"
            ? place.geometry.location.lng()
            : place.geometry.location.lng

        // Convert to string for the state
        setLatitud(String(lat))
        setLongitud(String(lng))

        console.log("Coordenadas extraídas:", lat, lng)

        // Update map immediately
        updateMapUrl(String(lat), String(lng))
      } else {
        console.log("No location data found in the API response. You'll need to enter coordinates manually.")
        // Don't show map if no coordinates
        setShowMap(false)
      }

      // Try to extract Instagram from social media links if available
      if (place.social_media && place.social_media.instagram) {
        setInstagram(place.social_media.instagram)
      }

      // Try to add photos if available
      if (place.photos && place.photos.length > 0) {
        const photoUrls = place.photos
          .slice(0, 3)
          .map(
            (photo) =>
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photo.photo_reference}&key=YOUR_GOOGLE_MAPS_API_KEY`,
          )
        setFotos(photoUrls)
      }

      // Clear search results and input
      setSearchResults([])
      setSearchValue("")
    } catch (error) {
      console.error("Error getting place details:", error)
      alert("Error al obtener detalles del lugar: " + error.message)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchValue("")
    setSearchResults([])
  }

  const handleNomChange = (e) => {
    setNom(e.target.value)
  }
  const handleTelChange = (e) => {
    setTel(e.target.value)
  }
  const handleWebChange = (e) => {
    setWeb(e.target.value)
  }
  const handleLongitudChange = (e) => {
    const value = e.target.value
    setLongitud(value)

    // Only update map if both values are present and valid
    if (latitud && value && !isNaN(Number.parseFloat(latitud)) && !isNaN(Number.parseFloat(value))) {
      console.log("Updating map with manual lng input:", latitud, value)
      updateMapUrl(latitud, value)
    } else {
      setShowMap(false)
    }
  }
  const handleLatitudChange = (e) => {
    const value = e.target.value
    setLatitud(value)

    // Only update map if both values are present and valid
    if (value && longitud && !isNaN(Number.parseFloat(value)) && !isNaN(Number.parseFloat(longitud))) {
      console.log("Updating map with manual lat input:", value, longitud)
      updateMapUrl(value, longitud)
    } else {
      setShowMap(false)
    }
  }
  const handleInstagramChange = (e) => {
    setInstagram(e.target.value)
  }
  const handleFotosChange = (index, value) => {
    const newFotos = [...foto]
    newFotos[index] = value
    setFotos(newFotos)
  }

  const addFotoInput = () => {
    setFotos([...foto, ""])
  }

  const removeFotoInput = (index) => {
    setFotos((prevFotos) => prevFotos.filter((_, i) => i !== index))
  }

  const handleDireccioChange = (e) => {
    setDireccio(e.target.value)
  }

  const sortUsersByLastName = (users) => {
    return users.sort((a, b) => {
      const lastNameA = (a.cognom || "").toLowerCase()
      const lastNameB = (b.cognom || "").toLowerCase()
      if (lastNameA < lastNameB) return -1
      if (lastNameA > lastNameB) return 1
      return (a.nom || "").toLowerCase().localeCompare((b.nom || "").toLowerCase())
    })
  }

  const sortUsers = (users) => {
    return users.sort((a, b) => {
      // Handle cases where nom might be undefined
      const nameA = a?.nom || ""
      const nameB = b?.nom || ""

      // Split names into parts
      const fullNameA = nameA.split(" ")
      const fullNameB = nameB.split(" ")

      // Get surnames with fallbacks
      const firstSurnameA =
        fullNameA.length > 1 ? (fullNameA[1] || "").toLowerCase() : (fullNameA[0] || "").toLowerCase()
      const firstSurnameB =
        fullNameB.length > 1 ? (fullNameB[1] || "").toLowerCase() : (fullNameB[0] || "").toLowerCase()

      // Safe comparison with empty string fallback
      const firstLetterA = firstSurnameA[0] || ""
      const firstLetterB = firstSurnameB[0] || ""

      if (firstLetterA !== firstLetterB) {
        return firstLetterA.localeCompare(firstLetterB)
      }

      return firstSurnameA.localeCompare(firstSurnameB || "")
    })
  }

  const groupedUsers = sortUsers(selectedUsers)

  const addNewWorker = () => {
    onOpen()
  }

  const selectUser = (userId) => {
    // Comprovar si l'usuari ja existeix al restaurant
    const userExists = selectedUsers.some((user) => user.userId === userId)

    if (userExists) {
      alert("Aquest usuari ja està afegit al restaurant.")
      onClose()
      return
    }

    const selectedUser = users.find((user) => user.id === userId)
    setSelectedUsers((prev) =>
      sortUsers([
        ...prev,
        {
          userId: userId,
          responsabilitat: "",
          propietari: false,
          anydeinici: "",
          nom: selectedUser ? `${selectedUser.nom} ${selectedUser.cognom}` : "",
          correu: selectedUser ? selectedUser.email : "",
          image: selectedUser ? selectedUser.imageUrl : "",
          instagram: selectedUser ? selectedUser.instagram : "",
          linkedin: selectedUser ? selectedUser.linkedin : "",
          mobil: selectedUser ? selectedUser.mobile : "",
        },
      ]),
    )
    setNewUsersCount((prevCount) => prevCount + 1)
    onClose()
  }

  const filteredUsers = sortUsersByLastName(
    users.filter(
      (user) =>
        `${user.nom} ${user.cognom}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  )

  const removeWorker = (index) => {
    setSelectedUsers((prevUsers) => prevUsers.filter((_, i) => i !== index))
  }

  const handlePropietariChange = (e) => {
    setPropietari(e.target.checked)
  }
  const handleUserChange = (index, field, value) => {
    setSelectedUsers((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)))
  }

  const handleBlur = (field) => {
    setTouchedFields((prevTouchedFields) => ({
      ...prevTouchedFields,
      [field]: true,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Convertir y validar longitud y latitud
    const numLongitud = Number.parseFloat(longitud)
    const numLatitud = Number.parseFloat(latitud)
    if (isNaN(numLongitud) || isNaN(numLatitud)) {
      alert("La longitud y la latitud deben ser números válidos.")
      return
    }

    // Verificación de campos requeridos - removed descripcio
    const requiredFields = [nom, tel, web, direccio]
    if (requiredFields.some((field) => !field) || foto.every((f) => !f)) {
      alert("Por favor, completa todos los campos obligatorios.")
      return
    }

    if (selectedUsers.some((user) => !user.userId || !user.anydeinici || !user.responsabilitat)) {
      alert("Por favor, completa todos los detalles de los treballadors.")
      return
    }

    try {
      const db = getFirestore(app)
      const newRestaurantRef = doc(collection(db, "Restaurant"))
      const restaurantData = {
        nom,
        tel,
        web,
        longitud: numLongitud,
        latitud: numLatitud,
        instagram, // Instagram is now optional
        foto,
        direccio,
        // Removed descripcio
      }

      // Guardar datos del restaurante
      await setDoc(newRestaurantRef, restaurantData)

      // Guardar datos de los treballadors
      for (const user of selectedUsers) {
        const userSnap = await getDoc(doc(db, "users", user.userId))
        if (userSnap.exists()) {
          const userData = userSnap.data()

          const alumnesRef = collection(db, "Restaurant", newRestaurantRef.id, "alumnes")

          const alumneData = {
            nom: `${userData.nom} ${userData.cognom}`,
            image: userData.imageUrl,
            correu: userData.email,
            responsabilitat: user.responsabilitat,
            propietari: user.propietari,
            anydeinici: user.anydeinici,
          }

          // Incluir campos opcionales solo si existen y no son vacíos
          if (userData.instagram) alumneData.instagram = userData.instagram
          if (userData.linkedin) alumneData.linkedin = userData.linkedin
          if (userData.mobile) alumneData.mobil = userData.mobile

          await setDoc(doc(alumnesRef), alumneData)
        }
      }

      console.log("Restaurante creado con éxito.")
      navigate("/success-restaurant")
    } catch (error) {
      console.error("Error al crear el restaurante:", error)
      alert("Error al crear el restaurante: " + error.message)
    }
  }

  // The form content that will be wrapped by the Sidebar
  const formContent = (
    <Box>
      {/* Remove the "Back to home" button since the sidebar already has navigation */}
      <VStack bg={"white"} width={"100%"} pt={150}>
        <Heading
          as="h1"
          fontFamily="'Hanken Grotesk', Arial, sans-serif"
          size="xl"
          w={{ base: "200", md: "600" }}
          maxW={600}
          mb={5}
          textAlign={"center"}
        >
          ¡Ja podeu començar a carregar les dades dels restaurants!
        </Heading>
      </VStack>
      <VStack as="form" onSubmit={handleSubmit}>
        <FormControl maxW={600}>
          <FormLabel fontWeight="bold" fontSize="lg">
            Buscar restaurant en Google Places
          </FormLabel>
          <Box position="relative">
            <InputGroup>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.500" />
              </InputLeftElement>
              <Input
                placeholder="Escriu el nom del restaurant..."
                value={searchValue}
                onChange={handleSearchInputChange}
                mb={2}
                pr="4.5rem"
              />
              {searchValue && (
                <Button position="absolute" right="2px" top="2px" h="2rem" size="sm" onClick={clearSearch}>
                  <CloseIcon boxSize={3} />
                </Button>
              )}
            </InputGroup>
            {isSearching && (
              <Flex justify="center" my={2}>
                <Spinner size="sm" mr={2} />
                <Text>Buscant restaurants...</Text>
              </Flex>
            )}
            {searchResults.length > 0 && (
              <Box
                maxH="300px"
                overflowY="auto"
                borderWidth={1}
                borderRadius="md"
                mb={4}
                boxShadow="md"
                position="absolute"
                bg="white"
                width="100%"
                zIndex={10}
              >
                {searchResults.map((place) => (
                  <Box
                    key={place.place_id}
                    p={3}
                    _hover={{ bg: "gray.100" }}
                    cursor="pointer"
                    onClick={() => handlePlaceSelection(place.place_id)}
                    borderBottomWidth={1}
                    borderBottomColor="gray.200"
                  >
                    <Text fontWeight="bold">{place.name}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {place.formatted_address}
                    </Text>
                    {place.types && place.types.length > 0 && (
                      <Flex mt={1} flexWrap="wrap" gap={1}>
                        {place.types.slice(0, 3).map((type, index) => (
                          <Badge key={index} colorScheme="blue" fontSize="xs">
                            {type.replace(/_/g, " ")}
                          </Badge>
                        ))}
                      </Flex>
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </Box>
          <Text fontSize="sm" color="gray.500" mt={1}>
            Busca el teu restaurant per omplir automàticament les dades
          </Text>
        </FormControl>

        {showMap && latitud && longitud && (
          <Box maxW={600} w="100%" mt={4} mb={6} borderRadius="md" overflow="hidden" boxShadow="md">
            <Box position="relative" h="300px" w="100%">
              {mapUrl ? (
                <Image
                  src={mapUrl || "/placeholder.svg"}
                  alt="Mapa de ubicación"
                  w="100%"
                  h="100%"
                  objectFit="cover"
                  onError={(e) => {
                    console.error("Error loading map image:", e)
                    e.target.onerror = null
                    e.target.src = "/placeholder.svg"
                    e.target.alt = "Error al cargar el mapa"
                  }}
                  fallback={
                    <Flex h="100%" justify="center" align="center" bg="gray.100">
                      <Text>No se pudo cargar el mapa. Verifique su API key.</Text>
                    </Flex>
                  }
                />
              ) : (
                <Flex h="100%" justify="center" align="center" bg="gray.100">
                  <Text>Generando mapa...</Text>
                </Flex>
              )}
              <Box position="absolute" bottom={2} right={2} bg="white" p={2} borderRadius="md" boxShadow="sm">
                <Text fontSize="sm" fontWeight="bold">
                  Lat: {latitud}, Lng: {longitud}
                </Text>
              </Box>
            </Box>
          </Box>
        )}

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Nom del restaurant</FormLabel>
          <Input
            type="text"
            value={nom}
            onChange={handleNomChange}
            onBlur={() => handleBlur("nom")}
            placeholder="Nom del restaurant"
            isInvalid={touchedFields.nom && !nom}
          />

          <FormHelperText mt={1} color={touchedFields.nom && !nom ? "red" : "gray"}>
            Introdueix el nom del restaurant
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Telèfon</FormLabel>
          <Input
            type="text"
            value={tel}
            onChange={handleTelChange}
            onBlur={() => handleBlur("tel")}
            placeholder="Telèfon"
            isInvalid={touchedFields.tel && !tel}
          />
          <FormHelperText mt={1} color={touchedFields.tel && !tel ? "red" : "gray"}>
            Introdueix el telèfon.
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Lloc web</FormLabel>
          <Input
            type="text"
            value={web}
            onChange={handleWebChange}
            onBlur={() => handleBlur("web")}
            placeholder="URL del lloc web"
            isInvalid={touchedFields.web && !web}
          />
          <FormHelperText mt={1} color={touchedFields.web && !web ? "red" : "gray"}>
            Introdueix la url del lloc web.
          </FormHelperText>
        </FormControl>

        <Flex maxW={600} w="100%" gap={4}>
          <FormControl isRequired flex="1">
            <FormLabel mt={5}>Latitud</FormLabel>
            <Input
              type="text"
              value={latitud}
              onChange={handleLatitudChange}
              onBlur={() => handleBlur("latitud")}
              placeholder="Latitud geográfica"
              isInvalid={touchedFields.latitud && !latitud}
            />
            <FormHelperText mt={1} color={touchedFields.latitud && !latitud ? "red" : "gray"}>
              Latitud
            </FormHelperText>
          </FormControl>

          <FormControl isRequired flex="1">
            <FormLabel mt={5}>Longitud</FormLabel>
            <Input
              type="text"
              value={longitud}
              onChange={handleLongitudChange}
              onBlur={() => handleBlur("longitud")}
              placeholder="Longitud geográfica"
              isInvalid={touchedFields.longitud && !longitud}
            />
            <FormHelperText mt={1} color={touchedFields.longitud && !longitud ? "red" : "gray"}>
              Longitud
            </FormHelperText>
          </FormControl>
        </Flex>

        {/* Changed Instagram to not be required */}
        <FormControl maxW={600}>
          <FormLabel mt={5}>Instagram</FormLabel>
          <Input
            type="text"
            value={instagram}
            onChange={handleInstagramChange}
            onBlur={() => handleBlur("instagram")}
            placeholder="Instagram (opcional)"
          />
          <FormHelperText mt={1} color="gray">
            Introdueix l'instagram del restaurant (opcional).
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Fotos</FormLabel>
          {foto.map((url, index) => (
            <Box key={index} position="relative" mb={2}>
              <Input
                type="text"
                value={url}
                onChange={(e) => handleFotosChange(index, e.target.value)}
                placeholder="URL de la foto"
                onBlur={() => handleBlur("foto")}
                isInvalid={touchedFields.foto && !url}
                pr="4rem"
              />
              <Button
                position="absolute"
                right="0"
                top="0"
                h="100%"
                colorScheme="red"
                onClick={() => removeFotoInput(index)}
              >
                <DeleteIcon />
              </Button>
            </Box>
          ))}
          <Button onClick={addFotoInput} colorScheme="blue" size="sm" mt={2}>
            <AddIcon mr={2} /> Afegir una altra foto
          </Button>

          <FormHelperText mt={1} color={touchedFields.foto && foto.every((f) => !f) ? "red" : "gray"}>
            Introdueix les URLs de les fotos del restaurant.
          </FormHelperText>
        </FormControl>

        <FormControl maxW={600} isRequired>
          <FormLabel mt={5}>Direcció</FormLabel>
          <Input
            type="text"
            value={direccio}
            onChange={handleDireccioChange}
            onBlur={() => handleBlur("direccio")}
            placeholder="Direcció"
            isInvalid={touchedFields.direccio && !direccio}
          />
          <FormHelperText mt={1} color={touchedFields.direccio && !direccio ? "red" : "gray"}>
            Introdueix la direcció del restaurant.
          </FormHelperText>
        </FormControl>

        {/* Removed description field */}

        <FormControl mb={5} maxW={600}>
          <Box>
            <FormLabel my={7}>Treballadors</FormLabel>

            {selectedUsers.length > 0 ? (
              <Tabs width="100%" p={4}>
                <TabList mb={6} spacing={4} flexWrap="wrap">
                  {groupedUsers.map((user) => (
                    <Tab key={user.userId}>
                      {user.nom
                        ? (() => {
                            const nameParts = user.nom.split(" ")
                            // Si hay al menos nombre y un apellido
                            if (nameParts.length > 1) {
                              const firstName = nameParts[0]
                              const firstSurname = nameParts[1]
                              return `${firstSurname}, ${firstName}`
                            }
                            return user.nom
                          })()
                        : "Usuari"}
                    </Tab>
                  ))}
                </TabList>
                <TabPanels>
                  {groupedUsers.map((user, index) => (
                    <TabPanel key={user.userId}>
                      <Text fontSize="md" fontWeight="bold" color="blue.500" mb={4}>
                        Usuaris nous afegits: {newUsersCount}
                      </Text>
                      <Box mb={6} w="100%" my={4} px={8} py={4} boxShadow={"3px 3px 8px 0 grey"} borderRadius={20}>
                        <FormControl mt={8} isRequired>
                          <FormLabel>Usuari</FormLabel>
                          <Text fontSize="lg">
                            {user.nom
                              ? (() => {
                                  const nameParts = user.nom.split(" ")
                                  // Si hay al menos nombre y un apellido
                                  if (nameParts.length > 1) {
                                    const firstName = nameParts[0]
                                    const firstSurname = nameParts[1]
                                    return `${firstSurname}, ${firstName}`
                                  }
                                  return user.nom
                                })()
                              : ""}
                          </Text>
                        </FormControl>
                        <FormControl mt={8} isRequired>
                          <FormLabel>Any de inici</FormLabel>
                          <Input
                            placeholder="Any de inici"
                            type="text"
                            value={user.anydeinici || ""}
                            onChange={(e) => handleUserChange(index, "anydeinici", e.target.value)}
                            size="lg"
                          />
                        </FormControl>
                        <FormControl mt={8} isRequired>
                          <FormLabel>Responsabilitat</FormLabel>
                          <Select
                            placeholder="Seleccionar Responsabilitat"
                            value={user.responsabilitat || ""}
                            onChange={(e) => handleUserChange(index, "responsabilitat", e.target.value)}
                            size="lg"
                          >
                            <option value="Cuiner">Cuiner</option>
                            <option value="Cambrer">Cambrer</option>
                            <option value="Gerent">Gerent</option>
                            <option value="Neteja">Neteja</option>
                            <option value="Altres">Altres</option>
                          </Select>
                        </FormControl>
                        <FormControl mt={5}>
                          <FormLabel>¿És propietari?</FormLabel>
                          <Checkbox
                            mb={10}
                            isChecked={user.propietari || false}
                            onChange={(e) => handleUserChange(index, "propietari", e.target.checked)}
                          >
                            És propietari
                          </Checkbox>
                        </FormControl>
                        <Button colorScheme="red" onClick={() => removeWorker(index)} mt={5}>
                          <DeleteIcon />
                        </Button>
                      </Box>
                    </TabPanel>
                  ))}
                </TabPanels>
              </Tabs>
            ) : (
              <Text>No hi ha treballadors afegits. Feu clic al botó per afegir-ne.</Text>
            )}
          </Box>
          <Button colorScheme="blue" onClick={addNewWorker} mt={5}>
            <AddIcon /> Afegir més treballadors
          </Button>
        </FormControl>

        <Button mt={5} mb={20} colorScheme="blue" type="submit">
          Carregar dades
        </Button>
      </VStack>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Seleccionar Treballador</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <InputGroup mb={4}>
              <InputLeftElement pointerEvents="none">
                <SearchIcon color="gray.300" />
              </InputLeftElement>
              <Input
                placeholder="Cercar treballador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
            <Stack spacing={4} maxHeight="60vh" overflowY="auto">
              {filteredUsers.map((user) => (
                <Flex
                  key={user.id}
                  p={3}
                  borderRadius="md"
                  alignItems="center"
                  _hover={{ bg: "gray.100", cursor: "pointer" }}
                  onClick={() => selectUser(user.id)}
                >
                  <Avatar src={user.imageUrl} name={`${user.nom} ${user.cognom}`} mr={3} />
                  <Box>
                    <Text fontWeight="bold">{`${user.cognom}, ${user.nom}`}</Text>
                    <Text fontSize="sm" color="gray.600">
                      {user.email}
                    </Text>
                  </Box>
                </Flex>
              ))}
            </Stack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Tancar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
  return <Sidebar>{formContent}</Sidebar>
}

export default RestaurantsForm

