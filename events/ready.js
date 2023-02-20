const readline = require('readline');
const axios = require('axios');
const Discord = require('discord.js');

module.exports = {
	name: 'ready',
	once: true,
	async execute(client) {
		await client.guilds.fetch(client.config.guildId)
		await client.guilds.cache.get(client.config.guildId).members.fetch()
		if (!client.guilds.cache.get(client.config.guildId).members.me.permissions.has("Administrator")) {
			console.log("\n⚠️⚠️⚠️ Eu não tenho a permissão de Administrador, para evitar quaisquer problemas, por favor adicione a permissão de Administrador para mim. ⚠️⚠️⚠️");
			process.exit(0);
		};

		async function sendEmbedToOpen() {
			const embedMessageId = await client.db.get("temp.openTicketMessageId");
			const openTicketChannel = await client.channels.fetch(client.config.openTicketChannelId).catch(e => console.error("The channel to open tickets is not found!\n", e));
			if (!openTicketChannel) {
				console.error("The channel to open tickets is not found!");
				return process.exit(0);
			}
			
			if (openTicketChannel.messages) {
				await openTicketChannel.messages.fetch(embedMessageId)
				.catch(e => console.error("Error when trying to fetch openTicketMessage:\n", e))
	
				try {if (embedMessageId) openTicketChannel.messages.cache.get(embedMessageId).delete();} catch (e) {console.error}
			};

			let embed = client.embeds.openTicket;

			embed.color = parseInt(client.config.mainColor, 16);
			// Please respect the project by keeping the credits, (if it is too disturbing you can credit me in the "about me" of the bot discord)
			embed.footer.text = "is.gd/ticketbot" + client.embeds.ticketOpened.footer.text.replace("is.gd/ticketbot", "") // Please respect the LICENSE :D
			// Please respect the project by keeping the credits, (if it is too disturbing you can credit me in the "about me" of the bot discord)

			const row = new Discord.ActionRowBuilder()
			.addComponents(
				new Discord.ButtonBuilder()
					.setCustomId('openTicket')
					.setLabel(client.locales.other.openTicketButtonMSG)
					.setStyle(Discord.ButtonStyle.Primary),
			);

			try { openTicketChannel.send({
				embeds: [embed],
				components: [row]
			})
			.then(msg => {
				client.db.set("temp.openTicketMessageId", msg.id);
			}) } catch(e) {console.error}
		};

		sendEmbedToOpen();

		readline.cursorTo(process.stdout, 0);
		process.stdout.write(`🚀  O bot está pronto! Conectado como\x1b[37;46;1m${client.user.tag}\x1b[0m (\x1b[37;46;1m${client.user.id}\x1b[0m)
		🌟  Você pode deixar uma estrela no GitHub: \x1b[37;46;1mhttps://github.com/philipxlima/ticket-bot \x1b[0m
		📖  Documentação: \x1b[37;46;1mhttps://ticket-bot.pages.dev \x1b[0m
		🪙  Hospede seu ticket-bot sendo um patrocinador a partir de 1$/mês: \x1b[37;46;1mhttps://github.com/sponsors/philipxlima \x1b[0m\n`.replace(/\t/g, ''));

		const a = await axios.get('https://raw.githubusercontent.com/philipxlima/sponsors/main/sponsors.json').catch(() => {});
		if (a) {
			const sponsors = a.data;
			const sponsorsList = sponsors.map(s => `\x1b]8;;https://github.com/${s.sponsor.login}\x1b\\\x1b[1m${s.sponsor.login}\x1b]8;;\x1b\\\x1b[0m`).join(', ');
			process.stdout.write(`💖  Graças aos nossos patrocinadores: ${sponsorsList}\n`)
		}
	},
};