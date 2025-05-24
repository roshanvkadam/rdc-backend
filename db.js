const fs = require('fs');
const path = require('path');

const FILE_PATH = path.join(__dirname, 'clients.json');

function loadClients() {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return {}; // Return empty object if file doesn't exist
    }
}

function saveClients(data) {
    fs.writeFileSync(FILE_PATH, JSON.stringify(data, null, 2));
}

function updateClientStatus(computer_name, updatedData) {
    const clients = loadClients();

    if (clients[computer_name]) {
        // Merge the updated data with the existing client data
        clients[computer_name] = {
            ...clients[computer_name],
            ...updatedData
        };
        saveClients(clients);
        console.log(`[DB] Client status updated: ${computer_name}`);
    } else {
        console.error('[DB] Client not found:', computer_name);
    }
}

function updateClient(clientData) {
    const clients = loadClients();
    clients[clientData.computer_name] = clientData;
    saveClients(clients);
}

function getClients() {
    return loadClients();
}

function removeClient(computer_name) {
    const clients = loadClients();

    if (clients[computer_name]) {
        delete clients[computer_name];
        saveClients(clients);
        console.log(`[DB] Client removed: ${computer_name}`);
        return true; 
    } else {
        console.error('[DB] Client not found:', computer_name);
        return false; 
    }
}

// Add to your exports at the bottom
module.exports = { updateClientStatus, updateClient, getClients, removeClient };