import { LanguageId } from '../store/settingsStore'

type TranslationKey =
  | 'settings' | 'profile' | 'appearance' | 'language' | 'timeDate'
  | 'logout' | 'save' | 'name' | 'title' | 'sport' | 'theme'
  | 'timeFormat' | 'dateFormat' | 'dashboard' | 'athletes' | 'teams'
  | 'calendar' | 'studio' | 'selectTheme' | 'profilePhoto' | 'changePhoto'
  | 'logoutConfirm' | 'version' | 'coachEdition' | 'languageLabel'
  | 'h12' | 'h24' | 'saved' | 'editProfile'

type Translations = Record<TranslationKey, string>

const translations: Record<LanguageId, Translations> = {
  en: {
    settings: 'Settings', profile: 'Profile', appearance: 'Appearance',
    language: 'Language', timeDate: 'Time & Date', logout: 'Log Out',
    save: 'Save Changes', name: 'Full Name', title: 'Title / Role',
    sport: 'Sport / Discipline', theme: 'Color Theme', timeFormat: 'Time Format',
    dateFormat: 'Date Format', dashboard: 'Dashboard', athletes: 'Athletes',
    teams: 'Teams', calendar: 'Calendar', studio: 'Studio',
    selectTheme: 'Select a theme', profilePhoto: 'Profile Photo',
    changePhoto: 'Change Photo', logoutConfirm: 'Are you sure you want to log out?',
    version: 'Version', coachEdition: 'Coach Edition', languageLabel: 'Display Language',
    h12: '12-hour (2:30 PM)', h24: '24-hour (14:30)', saved: 'Saved!', editProfile: 'Edit Profile',
  },
  es: {
    settings: 'Configuración', profile: 'Perfil', appearance: 'Apariencia',
    language: 'Idioma', timeDate: 'Hora y Fecha', logout: 'Cerrar Sesión',
    save: 'Guardar Cambios', name: 'Nombre Completo', title: 'Título / Rol',
    sport: 'Deporte / Disciplina', theme: 'Tema de Color', timeFormat: 'Formato de Hora',
    dateFormat: 'Formato de Fecha', dashboard: 'Panel', athletes: 'Atletas',
    teams: 'Equipos', calendar: 'Calendario', studio: 'Estudio',
    selectTheme: 'Seleccionar tema', profilePhoto: 'Foto de Perfil',
    changePhoto: 'Cambiar Foto', logoutConfirm: '¿Seguro que quieres cerrar sesión?',
    version: 'Versión', coachEdition: 'Edición Entrenador', languageLabel: 'Idioma de Pantalla',
    h12: '12 horas (2:30 PM)', h24: '24 horas (14:30)', saved: '¡Guardado!', editProfile: 'Editar Perfil',
  },
  fr: {
    settings: 'Paramètres', profile: 'Profil', appearance: 'Apparence',
    language: 'Langue', timeDate: 'Heure et Date', logout: 'Se Déconnecter',
    save: 'Enregistrer', name: 'Nom Complet', title: 'Titre / Rôle',
    sport: 'Sport / Discipline', theme: 'Thème de Couleur', timeFormat: "Format d'Heure",
    dateFormat: 'Format de Date', dashboard: 'Tableau de Bord', athletes: 'Athlètes',
    teams: 'Équipes', calendar: 'Calendrier', studio: 'Studio',
    selectTheme: 'Choisir un thème', profilePhoto: 'Photo de Profil',
    changePhoto: 'Changer la Photo', logoutConfirm: 'Voulez-vous vraiment vous déconnecter?',
    version: 'Version', coachEdition: 'Édition Coach', languageLabel: "Langue d'Affichage",
    h12: '12 heures (2:30 PM)', h24: '24 heures (14:30)', saved: 'Enregistré!', editProfile: 'Modifier le Profil',
  },
  pt: {
    settings: 'Configurações', profile: 'Perfil', appearance: 'Aparência',
    language: 'Idioma', timeDate: 'Hora e Data', logout: 'Sair',
    save: 'Salvar Alterações', name: 'Nome Completo', title: 'Título / Função',
    sport: 'Esporte / Disciplina', theme: 'Tema de Cor', timeFormat: 'Formato de Hora',
    dateFormat: 'Formato de Data', dashboard: 'Painel', athletes: 'Atletas',
    teams: 'Times', calendar: 'Calendário', studio: 'Estúdio',
    selectTheme: 'Selecionar tema', profilePhoto: 'Foto de Perfil',
    changePhoto: 'Alterar Foto', logoutConfirm: 'Tem certeza que deseja sair?',
    version: 'Versão', coachEdition: 'Edição Coach', languageLabel: 'Idioma de Exibição',
    h12: '12 horas (2:30 PM)', h24: '24 horas (14:30)', saved: 'Salvo!', editProfile: 'Editar Perfil',
  },
}

export function useTranslation(lang: LanguageId) {
  return (key: TranslationKey): string => translations[lang][key] ?? translations['en'][key] ?? key
}

export const languageOptions: { id: LanguageId; label: string; flag: string }[] = [
  { id: 'en', label: 'English',    flag: '🇺🇸' },
  { id: 'es', label: 'Español',    flag: '🇪🇸' },
  { id: 'fr', label: 'Français',   flag: '🇫🇷' },
  { id: 'pt', label: 'Português',  flag: '🇧🇷' },
]
