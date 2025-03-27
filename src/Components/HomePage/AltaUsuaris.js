import { useState, useEffect } from "react"
import {
  Box,
  Text,
  Image,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Spinner,
  useToast,
  VStack,
  HStack,
  Input,
  Avatar,
  Card,
  CardBody,
  Badge,
  IconButton,
  useDisclosure
} from "@chakra-ui/react"
import { useLocation } from "wouter"
import { db } from "../../firebaseConfig"
import { collection, getDocs, doc, setDoc, deleteDoc } from "firebase/firestore"
import { ChevronRightIcon } from "@chakra-ui/icons"
import { ChevronLeftIcon } from "@chakra-ui/icons"

const AltaUsuaris = () => {
  const [, setLocation] = useLocation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedUser, setSelectedUser] = useState(null)
  const { isOpen: isModalOpen, onOpen: openModal, onClose: closeModal } = useDisclosure()
  const { isOpen: isConfirmOpen, onOpen: openConfirm, onClose: closeConfirm } = useDisclosure()
  const { isOpen: isRejectOpen, onOpen: openReject, onClose: closeReject } = useDisclosure()
  const [rejectReason, setRejectReason] = useState("")
  const [processingAction, setProcessingAction] = useState(false)
  const toast = useToast()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const usersCollection = collection(db, "AltaUsers")
      const usersSnapshot = await getDocs(usersCollection)

      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      console.log("Usuarios cargados:", usersList.length)
      setUsers(usersList)
    } catch (error) {
      console.error("Error al cargar los usuarios:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const openUserDetails = (user) => {
    setSelectedUser(user)
    openModal()
  }

  const handleCloseModal = () => {
    closeModal()
    setSelectedUser(null)
  }

  const showConfirmModal = () => {
    closeModal()
    openConfirm()
  }

  const showRejectModal = () => {
    closeModal()
    openReject()
  }

  const acceptUser = async () => {
    if (!selectedUser) return

    setProcessingAction(true)
    try {
      await setDoc(doc(db, "users", selectedUser.userId), {
        username: selectedUser.username,
        apellidos: selectedUser.apellidos,
        email: selectedUser.email,
        imageUrl: selectedUser.imageUrl || null,
        mobilePhone: selectedUser.mobilePhone || null,
        birth: selectedUser.birth || null,
        academicStatus: selectedUser.academicStatus || "Alumne",
        instagram: selectedUser.instagram || null,
        linkedin: selectedUser.linkedin || null,
        restaurants: selectedUser.restaurants || [],
        createdAt: selectedUser.createdAt || new Date(),
        verified: true,
      })

      await deleteDoc(doc(db, "AltaUsers", selectedUser.id))
      setUsers(users.filter((user) => user.id !== selectedUser.id))

      toast({
        title: "Usuario Verificado",
        description: `${selectedUser.username} ha sido verificado correctamente.`,
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Error al verificar el usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo verificar el usuario. Inténtelo de nuevo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setProcessingAction(false)
      closeConfirm()
    }
  }

  const rejectUser = async () => {
    if (!selectedUser || !rejectReason.trim()) {
      toast({
        title: "Error",
        description: "Debe proporcionar un motivo para el rechazo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setProcessingAction(true)
    try {
      const rejectionData = {
        userId: selectedUser.userId,
        username: selectedUser.username,
        apellidos: selectedUser.apellidos,
        email: selectedUser.email,
        rejectionReason: rejectReason,
        rejectionDate: new Date(),
        imageUrl: selectedUser.imageUrl || null,
        mobilePhone: selectedUser.mobilePhone || null,
        birth: selectedUser.birth || null,
        instagram: selectedUser.instagram || null,
        linkedin: selectedUser.linkedin || null
      }

      await setDoc(doc(db, "RechazarUser", selectedUser.id), rejectionData)
      await deleteDoc(doc(db, "AltaUsers", selectedUser.id))

      toast({
        title: "Usuario Rechazado",
        description: `Se ha rechazado al usuario ${selectedUser.username}.`,
        status: "info",
        duration: 5000,
        isClosable: true,
      })

      setUsers(users.filter((user) => user.id !== selectedUser.id))
      closeReject()
      setRejectReason("")
    } catch (error) {
      console.error("Error al rechazar el usuario:", error)
      toast({
        title: "Error",
        description: "No se pudo rechazar el usuario. Inténtelo de nuevo.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setProcessingAction(false)
    }
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    )
  }

  return (
    <Box p={5} mt={20}>
      <Box position="fixed" top="80px" left="20px" zIndex="1000">
        <Button leftIcon={<ChevronLeftIcon />} colorScheme="gray" onClick={() => setLocation("/home")}>
          Tornar a l'inici
        </Button>
      </Box>
      <VStack spacing={4} align="stretch">
        {users.map((user) => (
          <Card key={user.id} onClick={() => openUserDetails(user)} cursor="pointer" _hover={{ shadow: "md" }}>
            <CardBody>
              <HStack spacing={4}>
                <Avatar
                  size="md"
                  src={user.imageUrl}
                  name={user.username}
                />
                <Box flex={1}>
                  <Text fontWeight="bold">{user.username || "Sin nombre"}</Text>
                  <Text color="gray.600">{user.email || "Sin email"}</Text>
                  {user.rejected && (
                    <Badge colorScheme="red">Rechazado</Badge>
                  )}
                </Box>
                <ChevronRightIcon />
              </HStack>
            </CardBody>
          </Card>
        ))}
      </VStack>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Detalles del Usuario</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <VStack spacing={4} align="stretch">
                <Avatar
                  size="2xl"
                  src={selectedUser.imageUrl}
                  name={selectedUser.username}
                  alignSelf="center"
                />
                <Text><strong>Nombre:</strong> {selectedUser.username}</Text>
                <Text><strong>Apellidos:</strong> {selectedUser.apellidos}</Text>
                <Text><strong>Email:</strong> {selectedUser.email}</Text>
                <Text><strong>Teléfono:</strong> {selectedUser.mobilePhone || "No especificado"}</Text>
                <Text><strong>Instagram:</strong> {selectedUser.instagram || "No especificado"}</Text>
                <Text><strong>LinkedIn:</strong> {selectedUser.linkedin || "No especificado"}</Text>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="red" mr={3} onClick={showRejectModal}>
              Rechazar
            </Button>
            <Button colorScheme="green" onClick={showConfirmModal}>
              Aceptar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isConfirmOpen} onClose={closeConfirm}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmar Aceptación</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            ¿Está seguro que desea aceptar a este usuario?
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={closeConfirm}>
              Cancelar
            </Button>
            <Button
              colorScheme="green"
              onClick={acceptUser}
              isLoading={processingAction}
            >
              Confirmar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isRejectOpen} onClose={closeReject}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Motivo del Rechazo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Input
              placeholder="Ingrese el motivo del rechazo"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={closeReject}>
              Cancelar
            </Button>
            <Button
              colorScheme="red"
              onClick={rejectUser}
              isLoading={processingAction}
            >
              Rechazar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}

export default AltaUsuaris
