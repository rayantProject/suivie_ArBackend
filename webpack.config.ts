import path from "path";
import nodeExternals from "webpack-node-externals";
import { Configuration } from "webpack";
import WebpackShellPluginNext from "webpack-shell-plugin-next";
import dotenv from "dotenv-webpack";
const getConfig = (
    env: { [key: string]: string },
    argv: { [key: string]: string }
): Configuration => {
    require("dotenv").config({
        path: path.resolve(__dirname, `.env.${env.mode}`),
    });
    return {
        entry: "./src/app.ts",
        target: "node",
        mode: argv.mode === "production" ? "production" : "development",
        externals: [nodeExternals()],
        plugins: [
            
            new WebpackShellPluginNext({
                onBuildStart: {
                    scripts: [
                        "echo 'RT api is starting...'",
                        "rimraf build",
                        "rimraf dist"
                    ],
                    blocking: true,
                    parallel: false,
                },
                onBuildEnd: {
                    // scripts: ["pm2 start build/index.js --watch"],
                    scripts: ["nodemon build/index.js --watch build"],
                    blocking: false,
                    parallel: true,
                }}),
            new dotenv()
        ],
        module: {
            rules: [{
                test: /\.(ts|js)$/,
                loader: "ts-loader",
                options: {},
                exclude: /node_modules/,
            }]
        },
        resolve: {
            extensions: [".ts", ".js"],
            alias: {
                src: path.resolve(__dirname, "src"),
            }
        },
        output: {
            path: path.join(__dirname, "build"),
            filename: "index.js",
        },
        optimization: {
            moduleIds: "deterministic",
            splitChunks: {
                chunks: "all",
            }
        }
    }
}

export default getConfig;