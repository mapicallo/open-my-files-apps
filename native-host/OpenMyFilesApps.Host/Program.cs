using System.Diagnostics;
using System.Text;
using System.Text.Json;
using System.Windows.Forms;

namespace OpenMyFilesApps.Host;

internal static class Program
{
    private const string Version = "0.1.2";

    [STAThread]
    private static int Main()
    {
        ApplicationConfiguration.Initialize();
        try
        {
            using var stdin = Console.OpenStandardInput();
            using var stdout = Console.OpenStandardOutput();

            while (true)
            {
                var lenBytes = new byte[4];
                if (!ReadExact(stdin, lenBytes, 4))
                    return 0;

                var len = BitConverter.ToInt32(lenBytes, 0);
                if (len is <= 0 or > 1024 * 1024)
                    return 1;

                var msgBytes = new byte[len];
                if (!ReadExact(stdin, msgBytes, len))
                    return 1;

                var json = Encoding.UTF8.GetString(msgBytes);
                var response = HandleMessage(json);
                var outBytes = Encoding.UTF8.GetBytes(response);
                var outLen = BitConverter.GetBytes(outBytes.Length);
                stdout.Write(outLen, 0, 4);
                stdout.Write(outBytes, 0, outBytes.Length);
                stdout.Flush();
            }
        }
        catch
        {
            return 1;
        }
    }

    private static bool ReadExact(Stream stream, byte[] buffer, int count)
    {
        var read = 0;
        while (read < count)
        {
            var n = stream.Read(buffer, read, count - read);
            if (n == 0)
                return false;
            read += n;
        }
        return true;
    }

    private static string HandleMessage(string json)
    {
        try
        {
            using var doc = JsonDocument.Parse(json);
            var root = doc.RootElement;
            if (!root.TryGetProperty("op", out var opEl))
                return JsonSerializer.Serialize(new { ok = false, error = "missing op" });

            var op = opEl.GetString();
            return op switch
            {
                "ping" => JsonSerializer.Serialize(new Dictionary<string, object> { ["ok"] = true, ["version"] = Version }),
                "pickFile" => PickFile(),
                "pickFolder" => PickFolder(),
                "launch" => Launch(root),
                _ => JsonSerializer.Serialize(new { ok = false, error = "unknown op" })
            };
        }
        catch (Exception ex)
        {
            return JsonSerializer.Serialize(new { ok = false, error = ex.Message });
        }
    }

    private static string PickFile()
    {
        using var ofd = new OpenFileDialog
        {
            Title = "Open my files & apps — choose file",
            CheckFileExists = true,
            DereferenceLinks = true
        };
        if (ofd.ShowDialog() != DialogResult.OK)
            return JsonSerializer.Serialize(new { ok = false, cancelled = true });

        var name = Path.GetFileNameWithoutExtension(ofd.FileName);
        return JsonSerializer.Serialize(new
        {
            ok = true,
            path = ofd.FileName,
            suggestedName = string.IsNullOrEmpty(name) ? ofd.FileName : name
        });
    }

    private static string PickFolder()
    {
        using var fbd = new FolderBrowserDialog
        {
            Description = "Open my files & apps — choose folder",
            UseDescriptionForTitle = true
        };
        if (fbd.ShowDialog() != DialogResult.OK || string.IsNullOrWhiteSpace(fbd.SelectedPath))
            return JsonSerializer.Serialize(new { ok = false, cancelled = true });

        var leaf = fbd.SelectedPath.TrimEnd(Path.DirectorySeparatorChar, Path.AltDirectorySeparatorChar);
        var folderName = Path.GetFileName(leaf);
        return JsonSerializer.Serialize(new
        {
            ok = true,
            path = fbd.SelectedPath,
            suggestedName = string.IsNullOrEmpty(folderName) ? fbd.SelectedPath : folderName
        });
    }

    private static string Launch(JsonElement root)
    {
        if (!root.TryGetProperty("items", out var itemsEl) || itemsEl.ValueKind != JsonValueKind.Array)
            return JsonSerializer.Serialize(new { ok = false, error = "items array required" });

        var errors = new List<string>();
        foreach (var el in itemsEl.EnumerateArray())
        {
            if (!el.TryGetProperty("kind", out var kEl) || !el.TryGetProperty("target", out var tEl))
                continue;
            var kind = kEl.GetString();
            var target = tEl.GetString();
            if (string.IsNullOrWhiteSpace(target))
                continue;

            try
            {
                var psi = new ProcessStartInfo
                {
                    FileName = target,
                    UseShellExecute = true
                };
                if (kind == "file")
                {
                    var dir = Path.GetDirectoryName(target);
                    if (!string.IsNullOrWhiteSpace(dir) && Directory.Exists(dir))
                        psi.WorkingDirectory = dir;
                }

                Process.Start(psi);
            }
            catch (Exception ex)
            {
                errors.Add($"{target}: {ex.Message}");
            }
        }

        return JsonSerializer.Serialize(new { ok = true, errors });
    }
}
