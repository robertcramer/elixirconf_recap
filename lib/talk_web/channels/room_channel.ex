require IEx
defmodule TalkWeb.RoomChannel do
  use TalkWeb, :channel
  alias TalkWeb.MyPresence

  def join("room:lobby", payload, socket) do
    if authorized?(payload) do
      socket = assign(socket, :username, payload["username"])
      send(self(), :after_join)
      {:ok, socket}
    else
      {:error, %{reason: "unauthorized"}}
    end
  end

  # Channels can be used in a request/response fashion
  # by sending replies to requests from the client
  def handle_in("ping", payload, socket) do
    {:reply, {:ok, payload}, socket}
  end

  # It is also common to receive messages from the client and
  # broadcast to everyone in the current topic (room:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  def handle_info(:after_join, socket) do
    {:ok, _} = MyPresence.track(socket, socket.assigns.username, %{
      online_at: inspect(System.system_time(:seconds))
    })
    broadcast! socket, "presence_state", MyPresence.list(socket)
    {:noreply, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
