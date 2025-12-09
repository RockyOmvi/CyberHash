type LogMessageHandler = (message: LogMessage) => void;

export interface LogMessage {
    timestamp: string;
    level: string;
    message: string;
}

export class WebSocketService {
    private ws: WebSocket | null = null;
    private handlers: LogMessageHandler[] = [];
    private url: string;

    constructor(url: string) {
        this.url = url;
    }

    connect() {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
            console.log('WebSocket connected');
        };

        this.ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                this.notifyHandlers(data);
            } catch (err) {
                console.error('Failed to parse WebSocket message', err);
            }
        };

        this.ws.onclose = () => {
            console.log('WebSocket disconnected. Reconnecting in 3s...');
            setTimeout(() => this.connect(), 3000);
        };

        this.ws.onerror = (err) => {
            console.error('WebSocket error', err);
            this.ws?.close();
        };
    }

    subscribe(handler: LogMessageHandler) {
        this.handlers.push(handler);
        return () => {
            this.handlers = this.handlers.filter(h => h !== handler);
        };
    }

    private notifyHandlers(message: LogMessage) {
        this.handlers.forEach(h => h(message));
    }
}

export const wsService = new WebSocketService('ws://localhost:8080/ws');
