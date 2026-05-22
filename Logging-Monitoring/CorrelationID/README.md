# Correlation ID & Request Tracing Example

This example demonstrates how to implement and propagate **Correlation IDs** across multiple microservices using Node.js and Express.

## 🧐 The Scenario

1.  A user makes a request to the **Order Service**.
2.  The **Order Service** generates a unique `Correlation-ID`.
3.  The **Order Service** calls the **Payment Service**, passing the `Correlation-ID` in the headers.
4.  Both services log their activities using this ID.
5.  If a failure occurs in the Payment Service, we can search all logs across both services using the same ID to see the full execution path.

## 🛠️ Components

- **Order Service (Port 3000)**: Entry point, generates the ID.
- **Payment Service (Port 3001)**: Downstream service, receives and propagates the ID.

## 🚀 How to Run

1.  **Install dependencies**:

    ```bash
    npm install
    ```

2.  **Start the Payment Service**:

    ```bash
    npm run start:payment
    ```

3.  **Start the Order Service** (in a new terminal):

    ```bash
    npm run start:order
    ```

4.  **Make a request**:
    ```bash
    curl http://localhost:3000/create-order
    ```

## 🔍 Observability in Action

Look at your terminal logs. You will see something like this:

**Order Service:**

```text
[Order Service] [550e8400-e29b-41d4-a716-446655440000] Received request for: /create-order
[Order Service] [550e8400-e29b-41d4-a716-446655440000] Creating order #423
```

**Payment Service:**

```text
[Payment Service] [550e8400-e29b-41d4-a716-446655440000] Received payment request
[Payment Service] [550e8400-e29b-41d4-a716-446655440000] Processing payment...
```

Notice how the UUID `550e8400...` is identical across both services. In a real system, you would send these logs to a centralized system (ELK, Splunk, Datadog), where you can filter by this ID to see exactly what happened.

## 💡 Key Lessons

1.  **Middleware**: Always use middleware to extract/generate the ID at the start of a request.
2.  **Downstream Propagation**: Ensure your HTTP client (Axios, Fetch) is configured to pass the ID to every downstream service.
3.  **Response Headers**: Return the ID to the client. If a user reports an error, they can provide the Correlation ID, allowing you to find their specific logs instantly.
4.  **Standardization**: While we used `x-correlation-id`, consider using the W3C standard `traceparent` for better compatibility with modern tracing tools like OpenTelemetry.
