"use client"
import {
  Box,
  Flex,
  VStack,
  Text,
  Icon,
  Divider,
  useColorModeValue,
  IconButton,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  useDisclosure,
} from "@chakra-ui/react"
import { FiHome, FiUsers, FiPlusCircle, FiList, FiCoffee, FiMenu } from "react-icons/fi"
import { Link } from "wouter"

// Definición de los elementos de navegación con las rutas correctas
const navItems = [
  { name: "Inicio", icon: FiHome, path: "/home" },
  { name: "Ingressar alumnes", icon: FiPlusCircle, path: "/Ingressar-alumnes" },
  { name: "Veure alumnes", icon: FiList, path: "/veure-alumnes" },
  { name: "Ingressar restaurants", icon: FiCoffee, path: "/Ingressar-restaurants" },
  { name: "Veure restaurants", icon: FiList, path: "/veure-restaurants" },
  { name: "Usuaris Alta", icon: FiUsers, path: "/alta-usuaris" },
]

// Componente para elementos de navegación
const NavItem = ({ icon, children, path, ...rest }) => {
  const bgHover = useColorModeValue("gray.100", "gray.700")

  return (
    <Link href={path}>
      <Flex
        align="center"
        p="4"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        _hover={{
          bg: bgHover,
          color: "blue.500",
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
            _groupHover={{
              color: "blue.500",
            }}
          />
        )}
        {children}
      </Flex>
    </Link>
  )
}

// Componente de barra lateral para escritorio
const DesktopSidebar = ({ onClose, ...rest }) => {
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  return (
    <Box
      w={{ base: "full", md: 60 }}
      pos="fixed"
      h="full"
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontWeight="bold" color="blue.500">
          Joviat Admin
        </Text>
      </Flex>
      <VStack spacing={0} align="stretch">
        {navItems.map((item) => (
          <NavItem key={item.name} icon={item.icon} path={item.path}>
            {item.name}
          </NavItem>
        ))}
      </VStack>
      <Divider my={6} />
      <Box px={8} mb={6}>
        <Text fontSize="sm" color="gray.500">
          © 2025 Joviat
        </Text>
      </Box>
    </Box>
  )
}

// Componente de barra lateral para móvil
const MobileSidebar = ({ isOpen, onClose }) => {
  return (
    <Drawer
      autoFocus={false}
      isOpen={isOpen}
      placement="left"
      onClose={onClose}
      returnFocusOnClose={false}
      onOverlayClick={onClose}
      size="full"
    >
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerBody p={0}>
          <DesktopSidebar onClose={onClose} />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

// Componente principal de la barra lateral
const Sidebar = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box minH="100vh">
      <DesktopSidebar display={{ base: "none", md: "block" }} />
      <MobileSidebar isOpen={isOpen} onClose={onClose} />
      <Box ml={{ base: 0, md: 60 }} p="4">
        <Flex display={{ base: "flex", md: "none" }} alignItems="center" justifyContent="flex-start" mb={4}>
          <IconButton variant="outline" onClick={onOpen} aria-label="abrir menú" icon={<FiMenu />} />
        </Flex>
        {children}
      </Box>
    </Box>
  )
}

export default Sidebar

