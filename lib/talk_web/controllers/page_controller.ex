defmodule TalkWeb.PageController do
  use TalkWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end

  def admin(conn, _params) do
    Agent.start_link(fn -> 0 end, name: :slide_state)
    render conn, "admin.html"
  end
end
