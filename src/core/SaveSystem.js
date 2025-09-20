// 💾 SISTEMA DE GUARDADO
// =====================
// Maneja persistencia local del juego

export class SaveSystem {
  constructor() {
    this.storageKey = 'miPececito_saveData';
    this.data = null;
    this.version = '1.0.0';
  }
  
  // 💾 Guardar datos
  async save(gameData) {
    try {
      const saveData = {
        version: this.version,
        timestamp: Date.now(),
        data: gameData
      };
      
      const jsonData = JSON.stringify(saveData);
      localStorage.setItem(this.storageKey, jsonData);
      
      console.log('💾 Juego guardado correctamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error guardando:', error);
      return false;
    }
  }
  
  // 📁 Cargar datos
  async load() {
    try {
      const savedJson = localStorage.getItem(this.storageKey);
      
      if (!savedJson) {
        console.log('📁 No hay datos guardados, iniciando nuevo juego');
        this.data = null;
        return null;
      }
      
      const saveData = JSON.parse(savedJson);
      
      // Verificar versión
      if (saveData.version !== this.version) {
        console.warn('⚠️ Versión de guardado diferente, migrando...');
        this.data = this.migrateData(saveData);
      } else {
        this.data = saveData.data;
      }
      
      console.log('📁 Datos cargados correctamente');
      return this.data;
      
    } catch (error) {
      console.error('❌ Error cargando datos:', error);
      this.data = null;
      return null;
    }
  }
  
  // 🔄 Migrar datos de versiones anteriores
  migrateData(oldSaveData) {
    // Aquí implementarías lógica de migración entre versiones
    console.log(`🔄 Migrando desde versión ${oldSaveData.version} a ${this.version}`);
    
    // Por ahora, simplemente usar los datos existentes
    return oldSaveData.data;
  }
  
  // 🗑️ Borrar datos guardados
  async clear() {
    try {
      localStorage.removeItem(this.storageKey);
      this.data = null;
      console.log('🗑️ Datos borrados correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error borrando datos:', error);
      return false;
    }
  }
  
  // 📊 Verificar si existen datos guardados
  hasData() {
    return localStorage.getItem(this.storageKey) !== null;
  }
  
  // 📈 Exportar datos (para backup)
  export() {
    try {
      const saveData = localStorage.getItem(this.storageKey);
      if (saveData) {
        const blob = new Blob([saveData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mi-pececito-backup-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        console.log('📈 Datos exportados correctamente');
        return true;
      }
    } catch (error) {
      console.error('❌ Error exportando:', error);
      return false;
    }
  }
  
  // 📥 Importar datos (desde backup)
  async import(file) {
    try {
      const text = await file.text();
      const saveData = JSON.parse(text);
      
      // Validar estructura
      if (!saveData.version || !saveData.data) {
        throw new Error('Formato de archivo inválido');
      }
      
      // Guardar datos importados
      localStorage.setItem(this.storageKey, text);
      this.data = saveData.data;
      
      console.log('📥 Datos importados correctamente');
      return true;
      
    } catch (error) {
      console.error('❌ Error importando:', error);
      return false;
    }
  }
}

