class Whitebit < Formula
  desc "WhiteBIT Exchange CLI"
  homepage "https://github.com/whitebit-exchange/cli"
  version "0.1.0"
  license "Apache-2.0"
  
  on_macos do
    on_arm do
      url "https://github.com/whitebit-exchange/cli/releases/download/v#{version}/whitebit-darwin-arm64"
      sha256 "PLACEHOLDER"
    end
    on_intel do
      url "https://github.com/whitebit-exchange/cli/releases/download/v#{version}/whitebit-darwin-x64"
      sha256 "PLACEHOLDER"
    end
  end
  
  on_linux do
    on_arm do
      url "https://github.com/whitebit-exchange/cli/releases/download/v#{version}/whitebit-linux-arm64"
      sha256 "PLACEHOLDER"
    end
    on_intel do
      url "https://github.com/whitebit-exchange/cli/releases/download/v#{version}/whitebit-linux-x64"
      sha256 "PLACEHOLDER"
    end
  end
  
  def install
    bin.install stable.url.split("/").last => "whitebit"
  end
  
  test do
    assert_match version.to_s, shell_output("#{bin}/whitebit --version")
  end
end
