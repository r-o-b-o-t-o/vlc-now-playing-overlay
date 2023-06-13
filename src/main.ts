import fs from "fs";
import path from "path";
import fsx from "fs-extra";
import express from "express";

const config = JSON.parse(fs.readFileSync(path.join(__dirname, "..", "config.json")).toString());

const expandVariables = (str: string) => {
	if (process.platform === "win32") {
		return str.replace(/%([^%]+)%/g, (_, n) => process.env[n] ?? "");
	}
	return str.replace(/\$([A-Z_]+[A-Z0-9_]*)|\${([A-Z0-9_]*)}/ig, (_, a, b) => process.env[a || b] ?? "")
};

const getVlcFilePath = (name: string) => {
	return path.join(expandVariables(config.vlcDataDir), name);
};

const readTextFile = async (name: string) => {
	const file = getVlcFilePath(name);
	try {
		return (await fsx.readFile(file)).toString().trim();
	} catch (err) {
		return "";
	}
};

const readTitle = async () => {
	return await readTextFile("np_title.txt");
};

const readArtist = async () => {
	return await readTextFile("np_artist.txt");
};

const readAlbum = async () => {
	return await readTextFile("np_album.txt");
};

const readArtwork = async () => {
	try {
		const file = path.join(expandVariables(config.vlcDataDir), "np_artwork.jpg");
		return (await fsx.readFile(file)).toString("base64");
	} catch (err) {
		return null;
	}
};

const main = () => {
	const app = express();

	app.use(express.static("static"));

	app.get("/", (req, res) => {
		res.sendFile(path.join(__dirname, "..", "static", "html", "index.html"));
	});

	app.get("/data", async (req, res) => {
		const title = await readTitle();
		const artist = await readArtist();
		const album = await readAlbum();
		const artwork = await readArtwork();

		res.json({
			title,
			artist,
			album,
			artwork,
		});
	});

	app.listen(config.port, () => {
		console.log(`Example app listening on port ${config.port}`);
	});
};

main();
