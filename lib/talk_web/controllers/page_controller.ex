defmodule TalkWeb.PageController do
  use TalkWeb, :controller

  def index(conn, _params) do
    render conn, "index.html"
  end
end
