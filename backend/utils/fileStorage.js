const fs = require('fs');
const path = require('path');

// Path to the data file
const DATA_FILE_PATH = path.join(__dirname, '../data/users.json');
const DATA_DIR = path.dirname(DATA_FILE_PATH);

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize default data if file doesn't exist
const initializeDataFile = () => {
  if (!fs.existsSync(DATA_FILE_PATH)) {
    const defaultData = {
      users: [
        {
          id: '1',
          name: 'Admin User',
          email: 'admin@handycurv.com',
          password: '$2a$10$example_hash', // In real app, this would be hashed
          role: 'admin',
          phone: '',
          address: {},
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        }
      ],
      lastUserId: 1
    };
    
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(defaultData, null, 2));
    console.log('✅ Created default users data file');
  }
};

// Read data from file
const readData = () => {
  try {
    if (fs.existsSync(DATA_FILE_PATH)) {
      const data = fs.readFileSync(DATA_FILE_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading data file:', error);
  }
  
  // Return default data if file doesn't exist or is corrupted
  return {
    users: [
      {
        id: '1',
        name: 'Admin User',
        email: 'admin@handycurv.com',
        password: '$2a$10$example_hash',
        role: 'admin',
        phone: '',
        address: {},
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    ],
    lastUserId: 1
  };
};

// Write data to file
const writeData = (data) => {
  try {
    fs.writeFileSync(DATA_FILE_PATH, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing data file:', error);
    return false;
  }
};

// Get all users
const getUsers = () => {
  const data = readData();
  return data.users || [];
};

// Get user by email
const getUserByEmail = (email) => {
  const users = getUsers();
  return users.find(user => user.email === email);
};

// Get user by ID
const getUserById = (id) => {
  const users = getUsers();
  return users.find(user => user.id === id);
};

// Add new user
const addUser = (userData) => {
  const data = readData();
  const newId = (data.lastUserId + 1).toString();
  
  const newUser = {
    id: newId,
    ...userData,
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString()
  };
  
  data.users.push(newUser);
  data.lastUserId = parseInt(newId);
  
  if (writeData(data)) {
    return newUser;
  }
  return null;
};

// Update user
const updateUser = (id, updates) => {
  const data = readData();
  const userIndex = data.users.findIndex(user => user.id === id);
  
  if (userIndex !== -1) {
    data.users[userIndex] = { ...data.users[userIndex], ...updates };
    if (writeData(data)) {
      return data.users[userIndex];
    }
  }
  return null;
};

// Update user last login
const updateLastLogin = (id) => {
  return updateUser(id, { lastLogin: new Date().toISOString() });
};

// Delete user (optional, for admin purposes)
const deleteUser = (id) => {
  const data = readData();
  const userIndex = data.users.findIndex(user => user.id === id);
  
  if (userIndex !== -1) {
    data.users.splice(userIndex, 1);
    return writeData(data);
  }
  return false;
};

// Initialize the data file when module is loaded
initializeDataFile();

module.exports = {
  getUsers,
  getUserByEmail,
  getUserById,
  addUser,
  updateUser,
  updateLastLogin,
  deleteUser,
  readData,
  writeData
}; 