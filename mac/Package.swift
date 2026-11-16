// swift-tools-version:5.9
import PackageDescription

// SamwiseCore holds the alarm rules (when to show what) with no screen code, so it is tested on its own.
// Samwise is the Mac app around it.
var targets: [Target] = [
    .target(name: "SamwiseCore", path: "Sources/SamwiseCore"),
    .testTarget(name: "SamwiseCoreTests", dependencies: ["SamwiseCore"], path: "Tests/SamwiseCoreTests"),
]

#if os(macOS)
targets.append(.executableTarget(name: "Samwise", dependencies: ["SamwiseCore"], path: "Sources/Samwise"))
#endif

let package = Package(
    name: "Samwise",
    platforms: [.macOS(.v13)],
    targets: targets
)
