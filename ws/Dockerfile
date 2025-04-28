FROM golang:1.24-alpine AS builder

WORKDIR /app

COPY go.mod go.sum* ./

RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o websocket-server .

FROM alpine:3.17

RUN apk --no-cache add ca-certificates

WORKDIR /root/

COPY --from=builder /app/websocket-server .

EXPOSE 8080

CMD ["./websocket-server"]
