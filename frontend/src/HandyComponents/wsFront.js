import { moveFunctions } from "../Game/utils/ChessLogicCC";
import { boardSize } from "../Contexts/LogContext";
import { timeControl } from "../Game/InfoTab";

export class WebSocketClient { // najpierw dajmy tak żeby user grał tylko jedną partię na raz potem się zmieni
    constructor(url, premove) {
        this.url = url;
        this.ws = null;
        this.isTransitioning = false;
        this.lastTimestamp = null;
        this.premove = premove;
    }

    async convert2JSON(message) {
        if(typeof message?.data === 'string') { // JSON
            return JSON.parse(message.data);
        } else { // Blob
            return JSON.parse(await message.data.text());
        }
    }

    connect() {
        if(this.isTransitioning) {
            console.log("Connection already exists.");
            return
        }

        this.ws = new WebSocket(this.url);
        this.isTransitioning = true; // connecting

        this.ws.onmessage = async (message) => {
            try {
                const messageJSON = await this.convert2JSON(message)
                if(messageJSON.type === 'delay') {
                    const { newTimestamp, oldTimestamp } = messageJSON;
                    timeControl(newTimestamp - oldTimestamp);
                } else if(messageJSON.type === 'move') {
                    console.log('[OPPONENT MOVE] Received:', JSON.stringify(messageJSON));
                    const [content] = Object.values(messageJSON.body);
                    console.log('[OPPONENT MOVE] Extracted content:', content, 'fromX:', content.finalSquares.x - content.move.x, 'fromY:', boardSize - content.finalSquares.y + content.move.y - 1);

                    const fromX = content.finalSquares.x - content.move.x;
                    const fromY = boardSize - content.finalSquares.y + content.move.y - 1;

                    timeControl(messageJSON.oldTimestamp - Date.now());

                    const enemyPiece = this.premove.playerPieces.current.enemyPieces.find(p => p.current.x === fromX && p.current.y === fromY);
                    await moveFunctions.functions[enemyPiece.current.pieceId](content.move.x, -content.move.y, messageJSON?.promotes ?? '');
                    await this.premove.applyPremove(true);
                } else if(messageJSON.type === 'premove') {
                    const [premoveData] = Object.values(messageJSON.body);
                    if(premoveData.pieceId) {
                        const [prefix, i, j] = premoveData.pieceId.split('-');
                        premoveData.pieceId = `${prefix}-${i}-${boardSize - parseInt(j) - 1}`;
                    }
                    this.premove.addPremove(premoveData, false);
                }
            } catch(error) {
                console.log("Error caught in wsClass.js:", error);
            }
        };
        
        this.ws.onping = (message) => {
            this.ws.pong(message);
        }

        this.ws.onopen = () => {
            this.isConnecting = false;
        };

        this.ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        this.ws.onclose = () => { // automatic reconnection after delay
            if(!this.isTransitioning) {
                setTimeout(() => this.connect(), 1000);
            }
        };
    }

    disconnect(closingReason) {
        if( this.ws ) {
            this.isTransitioning = true;
            this.ws.close(closingReason);
            this.ws = null;
        }
    }

    send(object) {
        if (this.ws?.readyState === this.ws.OPEN) {
            let toSend = object;
            if( object.type === 'move' ){
                toSend = ({...object, oldTimestamp: Date.now()});
            }
            this.ws.send( JSON.stringify(toSend) );
        }
    }
}