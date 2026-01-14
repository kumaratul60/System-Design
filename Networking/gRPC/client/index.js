// Import necessary modules for gRPC client
import grpc from '@grpc/grpc-js';
import protoLoader from '@grpc/proto-loader';

// Load the Protocol Buffer definition
// Same as server: protoLoader loads the .proto file
const PROTO_PATH = './customers.proto'; // Path to the .proto file relative to the current working directory
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

// Load the package definition
const customerProto = grpc.loadPackageDefinition(packageDefinition).customers;

// Create a gRPC client stub
// This connects to the server at the specified address
const client = new customerProto.CustomerService(
  'localhost:50051', // Server address and port
  grpc.credentials.createInsecure() // Use insecure credentials for development
);

// Example usage of the client to demonstrate each RPC method

// 1. GetAll: Retrieve all customers
console.log('Calling GetAll...');
client.GetAll({}, (error, response) => {
  if (error) {
    console.error('GetAll error:', error);
  } else {
    console.log('GetAll response:', response);
  }
});

// 2. Get: Retrieve a specific customer by ID
console.log('Calling Get with id=1...');
client.Get({ id: '1' }, (error, response) => {
  if (error) {
    console.error('Get error:', error);
  } else {
    console.log('Get response:', response);
  }
});

// 3. Insert: Add a new customer
const newCustomer = { name: 'Alice Johnson', age: 28, address: '789 Oak St' };
console.log('Calling Insert...');
client.Insert(newCustomer, (error, response) => {
  if (error) {
    console.error('Insert error:', error);
  } else {
    console.log('Insert response:', response);
    // Now GetAll again to see the new customer
    client.GetAll({}, (err, res) => {
      if (!err) console.log('GetAll after insert:', res);
    });
  }
});

// 4. Update: Update an existing customer
// Assuming the inserted customer got id=3
console.log('Calling Update...');
client.Update({ id: '3', name: 'Alice Johnson Updated', age: 29, address: '789 Oak St, Apt 1' }, (error, response) => {
  if (error) {
    console.error('Update error:', error);
  } else {
    console.log('Update response:', response);
  }
});

// 5. Remove: Delete a customer by ID
console.log('Calling Remove with id=2...');
client.Remove({ id: '2' }, (error, response) => {
  if (error) {
    console.error('Remove error:', error);
  } else {
    console.log('Remove response:', response);
    // GetAll to confirm removal
    client.GetAll({}, (err, res) => {
      if (!err) console.log('GetAll after remove:', res);
    });
  }
});

// Note: In a real application, handle asynchronous calls properly, perhaps using async/await or promises.
// gRPC calls are asynchronous, and the above calls may interleave.
// For real application, use secure credentials and handle errors appropriately.
