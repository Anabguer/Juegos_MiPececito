// 💾 UTILIDADES DE ALMACENAMIENTO
// ===============================
// Funciones helper para localStorage

export class StorageUtils {
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error guardando en localStorage:', error);
      return false;
    }
  }
  
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error leyendo localStorage:', error);
      return defaultValue;
    }
  }
  
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error eliminando de localStorage:', error);
      return false;
    }
  }
  
  static clear() {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error limpiando localStorage:', error);
      return false;
    }
  }
}

