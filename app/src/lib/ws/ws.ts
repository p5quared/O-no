interface WebSocketMessage {
  id: string;
  x: number;
  y: number;
}

interface WebSocketOptions {
  url: string;
  autoReconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

const DEFAULT_OPTIONS: WebSocketOptions = {
  url: 'ws://localhost:8080/ws',
  autoReconnect: true,
  reconnectInterval: 3000,
  maxReconnectAttempts: 5
};

type MessageCallback = (message: WebSocketMessage) => void;

type ConnectionCallback = (connected: boolean) => void;

/**
 * Creates a WebSocket client that can emit messages and subscribe to incoming messages
 * @param options Configuration options for the WebSocket connection
 * @returns Object with emit and subscribe functions
 */
export function createWebSocketClient(options: Partial<WebSocketOptions> = {}) {
  const config = { ...DEFAULT_OPTIONS, ...options };
  
  let socket: WebSocket | null = null;
  
  let reconnectAttempts = 0;
  let reconnectTimer: number | null = null;
  
  const messageCallbacks: MessageCallback[] = [];
  const connectionCallbacks: ConnectionCallback[] = [];
  
  let isConnected = false;
  
  /**
   * Initialize and connect the WebSocket
   */
  const connect = () => {
    if (socket) {
      socket.onclose = null;
      socket.onerror = null;
      socket.onmessage = null;
      socket.onopen = null;
      socket.close();
    }
    
    socket = new WebSocket(config.url);
    
    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        messageCallbacks.forEach(callback => callback(message));
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };
    
    socket.onopen = () => {
      console.log('WebSocket connection established');
      isConnected = true;
      reconnectAttempts = 0;
      connectionCallbacks.forEach(callback => callback(true));
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    socket.onclose = () => {
      console.log('WebSocket connection closed');
      isConnected = false;
      connectionCallbacks.forEach(callback => callback(false));
      
      if (config.autoReconnect && reconnectAttempts < (config.maxReconnectAttempts || 0)) {
        reconnectAttempts++;
        console.log(`Attempting to reconnect (${reconnectAttempts}/${config.maxReconnectAttempts})...`);
        
        if (reconnectTimer) {
          window.clearTimeout(reconnectTimer);
        }
        
        reconnectTimer = window.setTimeout(() => {
          connect();
        }, config.reconnectInterval);
      }
    };
  };
  
  /**
   * Emit a message to the WebSocket server
   * @param id Unique identifier for the message
   * @param x X coordinate
   * @param y Y coordinate
   * @returns Promise that resolves when the message is sent or rejects on error
   */
  const emitMessage = (id: string, x: number, y: number): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!socket || socket.readyState !== WebSocket.OPEN) {
        return reject(new Error('WebSocket is not connected'));
      }
      
      try {
        const message: WebSocketMessage = { id, x, y };
        socket.send(JSON.stringify(message));
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  };
  
  /**
   * Subscribe to incoming messages from the WebSocket server
   * @param callback Function to be called when a message is received
   * @returns Unsubscribe function
   */
  const subscribeToMessages = (callback: MessageCallback): () => void => {
    messageCallbacks.push(callback);
    
    return () => {
      const index = messageCallbacks.indexOf(callback);
      if (index !== -1) {
        messageCallbacks.splice(index, 1);
      }
    };
  };
  
  /**
   * Subscribe to connection state changes
   * @param callback Function to be called when connection state changes
   * @returns Unsubscribe function
   */
  const onConnectionChange = (callback: ConnectionCallback): () => void => {
    connectionCallbacks.push(callback);
    
    if (socket) {
      callback(isConnected);
    }
    
    return () => {
      const index = connectionCallbacks.indexOf(callback);
      if (index !== -1) {
        connectionCallbacks.splice(index, 1);
      }
    };
  };
  
  /**
   * Close the WebSocket connection
   */
  const disconnect = () => {
    if (reconnectTimer) {
      window.clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
    
    if (socket) {
      socket.close();
    }
  };
  
  connect();
  
  return {
    emitMessage,
    subscribeToMessages,
    onConnectionChange,
    disconnect,
    reconnect: connect,
    get isConnected() { return isConnected; }
  };
}

export const wsClient = createWebSocketClient();

// Example usage:
/*
// Create a WebSocket client
const wsClient = createWebSocketClient({
  url: 'ws://localhost:8080/ws' // Adjust based on your server URL
});

// Subscribe to incoming messages
const unsubscribe = wsClient.subscribeToMessages(message => {
  console.log('Received message:', message);
  // Process message...
});

// Monitor connection status
wsClient.onConnectionChange(connected => {
  console.log('Connection status:', connected ? 'Connected' : 'Disconnected');
});

// Emit a message
wsClient.emitMessage('cursor-1', 150, 200)
  .then(() => console.log('Message sent successfully'))
  .catch(error => console.error('Failed to send message:', error));

// Later, when done
unsubscribe();
wsClient.disconnect();
*/
