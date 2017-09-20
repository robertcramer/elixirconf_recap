defmodule TalkWeb.SlideChannel do
  use TalkWeb, :channel

  def join("slide:lobby", payload, socket) do
    if authorized?(payload) do
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
  # broadcast to everyone in the current topic (slide:lobby).
  def handle_in("shout", payload, socket) do
    broadcast socket, "shout", payload
    {:noreply, socket}
  end

  def handle_in("new:msg", msg, socket) do
    case msg["action"] do
      "add" ->
        Agent.update(:slide_state, fn number -> number+1 end)
      "subtract" ->
        Agent.update(:slide_state, fn number -> number-1 end)
    end
    slide = Agent.get(:slide_state, fn number -> number end)
    broadcast! socket, "new:msg", %{slide: slide}
    {:reply, {:ok, %{slide: slide}}, socket}
  end

  # Add authorization logic here as required.
  defp authorized?(_payload) do
    true
  end
end
