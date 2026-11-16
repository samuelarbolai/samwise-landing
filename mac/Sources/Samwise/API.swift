import Foundation

struct APIError: Error {
    let status: Int
    let message: String
}

/// The few calls the app makes to samwise.life. Nothing is sent without a connected account.
struct API {
    let base: URL

    private static let session: URLSession = {
        let c = URLSessionConfiguration.ephemeral
        c.timeoutIntervalForRequest = 20
        c.timeoutIntervalForResource = 30
        c.waitsForConnectivity = false
        return URLSession(configuration: c)
    }()

    func send(_ method: String, _ path: String, token: String? = nil, body: [String: Any]? = nil) async throws -> Data {
        guard let url = URL(string: path, relativeTo: base) else { throw APIError(status: 0, message: "bad address") }
        var request = URLRequest(url: url)
        request.httpMethod = method
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Samwise-Mac/\(appVersion)", forHTTPHeaderField: "User-Agent")
        if let token = token {
            request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        }
        if let body = body {
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            request.httpBody = try JSONSerialization.data(withJSONObject: body)
        }
        let (data, response) = try await API.session.data(for: request)
        let status = (response as? HTTPURLResponse)?.statusCode ?? 0
        guard (200..<300).contains(status) else {
            let json = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any]
            throw APIError(status: status, message: (json?["error"] as? String) ?? "")
        }
        return data
    }

    static func device() -> [String: Any] {
        let v = ProcessInfo.processInfo.operatingSystemVersion
        return [
            "device_name": Host.current().localizedName ?? "Mac",
            "app_version": appVersion,
            "os_version": "\(v.majorVersion).\(v.minorVersion).\(v.patchVersion)",
        ]
    }
}
