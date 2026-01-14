// Import necessary modules for gRPC
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

// Load the Protocol Buffer definition
// protoLoader loads the .proto file and converts it into a JavaScript object
const PROTO_PATH = './customers.proto'; // Path to the .proto file relative to the current working directory
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load the package definition into gRPC
const customerProto = grpc.loadPackageDefinition(packageDefinition).customers;

// In-memory data store for demonstration (in real apps, use a database)
let customers = [
  { id: '1', name: 'John Doe', age: 30, address: '123 Main St' },
  { id: '2', name: 'Jane Smith', age: 25, address: '456 Elm St' },
];

// Implement the service methods as defined in the .proto file
const serverImplementation = {
  // GetAll: Returns a list of all customers
  // This is a unary RPC (simple request-response)
  GetAll: (call, callback) => {
    console.log('GetAll called');
    callback(null, { customers });
  },

  // Get: Returns a single customer by ID
  // Takes CustomerRequestId and returns Customer
  Get: (call, callback) => {
    const { id } = call.request;
    console.log(`Get called with id: ${id}`);
    const customer = customers.find((c) => c.id === id);
    if (customer) {
      callback(null, customer);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Customer not found',
      });
    }
  },

  // Insert: Adds a new customer
  // Takes Customer and returns the inserted Customer
  Insert: (call, callback) => {
    const newCustomer = call.request;
    console.log(`Insert called with customer:`, newCustomer);
    // Generate a simple ID (in real apps, use UUID or database auto-increment)
    newCustomer.id = (customers.length + 1).toString();
    customers.push(newCustomer);
    callback(null, newCustomer);
  },

  // Update: Updates an existing customer
  // Takes Customer and returns the updated Customer
  Update: (call, callback) => {
    const updatedCustomer = call.request;
    console.log(`Update called with customer:`, updatedCustomer);
    const index = customers.findIndex((c) => c.id === updatedCustomer.id);
    if (index !== -1) {
      customers[index] = updatedCustomer;
      callback(null, updatedCustomer);
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Customer not found',
      });
    }
  },

  // Remove: Deletes a customer by ID
  // Takes CustomerRequestId and returns Empty
  Remove: (call, callback) => {
    const { id } = call.request;
    console.log(`Remove called with id: ${id}`);
    const index = customers.findIndex((c) => c.id === id);
    if (index !== -1) {
      customers.splice(index, 1);
      callback(null, {});
    } else {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Customer not found',
      });
    }
  },
};

// Create and start the gRPC server
const server = new grpc.Server();
server.addService(customerProto.CustomerService.service, serverImplementation);

// Bind the server to a port
const PORT = '0.0.0.0:50051'; // gRPC typically uses port 50051
server.bindAsync(PORT, grpc.ServerCredentials.createInsecure(), (error, port) => {
  if (error) {
    console.error('Failed to bind server:', error);
    return;
  }
  console.log(`gRPC server running at ${PORT}`);
  server.start();
});
