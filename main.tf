terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 2.0"
    }
  }
}

variable "vercel_api_token" {
  sensitive = true
}

variable "openrouter_api_key" {
  sensitive = true
}

provider "vercel" {
  api_token = var.vercel_api_token
}

resource "vercel_project" "canvas_lm" {
  name      = "canvas-lm"
  framework = "nextjs"

  git_repository = {
    type = "github"
    repo = "Nick-Chandler/canvas-lm"
  }

  install_command = "bun install"
  build_command   = "bun run build"
}

resource "vercel_project_environment_variable" "openrouter_api_key" {
  project_id = vercel_project.canvas_lm.id
  key        = "OPENROUTER_API_KEY"
  value      = var.openrouter_api_key
  target     = ["production", "preview"]
  sensitive  = true
}

output "deployment_url" {
  value = "https://${vercel_project.canvas_lm.name}.vercel.app"
}
