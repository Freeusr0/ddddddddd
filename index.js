const { Client, Intents, MessageButton, MessageEmbed, MessageActionRow , Modal, TextInputComponent, MessageAttachment, Permissions} = require('discord.js');
const db = require("pro.db")
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const token = '';

const rest = new REST({ version: '9' }).setToken(token);

const client = new Client({ intents: 32767 });

const commands = [
{name: "ping", description: "Respond Pong!"},
{name: 'auto-responses', description: 'Auto response manager',
 
 options: [
     {name: "add", description: "اضافة رد تلقائي", options: [{name: "reply", description: 'اذا كنت تريد جعل الرد عبر رسالة رد', required: true, choices: [{name: "True", value: "true"}, {name: "False", value: 'false'}], type: 3}], type: 1},
     {name: "remove", description: "ازالة رد تلقائي", type: 1, options: [{name: "id", description: "الرقم التعريفي للرد الذي تريد حذفه", type: 3, required: true}]},
     {name: "list", description: "عرض الردود التلقائية", type: 1}
]}
]

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    try {
  

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands },
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});


process.on("uncaughtException" , err => {
return console.log(err);

    
})
process.on("unhandledRejection" , err => {
return console.log(err);
})
process.on("rejectionHandled", error => {
return console.log(error);
}); 





client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;

    if (commandName === 'ping') {
        await interaction.reply(`Pong! ${client.ws.ping}ms`);
    } else if (commandName === 'auto-responses') {
        if(!interaction.member.permissions.has("ADMINISTRATOR")) return interaction.reply({content: "لا تمتلك صلاحيات كافية لتشغيل هذا الامر", ephemeral: true})
let subcmd = options.getSubcommand();
        if(subcmd == "add"){
            let reply_type = options.getString("reply");
            const modal = new Modal()
			.setCustomId('add-reponses')
			.setTitle('اضافة رد تلقائي');
		
		const messageText = new TextInputComponent()
			.setCustomId('message')
		    
			.setLabel("الرسالة")
		    .setPlaceholder("اذا وضعت نجمة بالاول لن يتم البحث عن الجملة داخل الرسالة")
            .setRequired(true)
			.setStyle('PARAGRAPH');
		const response1Text = new TextInputComponent()
			.setCustomId('response1')
			.setLabel("الرد")         .setPlaceholder("المتغيرات\n[users] [username] [userId] [userAvatar]\nيمكنك استخدامهم في جميع الردود")
            .setRequired(true)
			.setStyle('PARAGRAPH');
            const response2Text = new TextInputComponent()
			.setCustomId('response2')
			.setLabel("الرد الثاني (اختياري)")
            .setRequired(false)
			.setStyle('PARAGRAPH');
            const response3Text = new TextInputComponent()

			.setCustomId('response3')

			.setLabel("الرد الثالث (اختياري)")

            .setRequired(false)

			.setStyle('PARAGRAPH');
		const response4Text = new TextInputComponent()
			.setCustomId('response4')
			.setLabel("الرد الرابع (اختياري)")
            .setRequired(false)
			.setStyle('PARAGRAPH');
		const messageRow = new MessageActionRow().addComponents(messageText);
		const response1Row = new MessageActionRow().addComponents(response1Text);
		const response2Row = new MessageActionRow().addComponents(response2Text);
		const response3Row = new MessageActionRow().addComponents(response3Text);
		const response4Row = new MessageActionRow().addComponents(response4Text);         
		
		modal.addComponents(messageRow, response1Row, response2Row, response3Row, response4Row);
		
		await interaction.showModal(modal);
            
	const submitted = await interaction.awaitModalSubmit({
  time: 60000,
  filter: i => i.user.id === interaction.user.id,
}).catch(error => {
 
  return null
})

if (submitted) {
  const message = submitted.fields.getTextInputValue("message");
    const response1 = submitted.fields.getTextInputValue("response1");
    const response2 = submitted.fields.getTextInputValue("response2");
    const response3 = submitted.fields.getTextInputValue("response3");
    const response4 = submitted.fields.getTextInputValue("response4");
    let genId = Id();
    let data = db.get(`auto-response`)
    if(db.has("auto-response")){
 for(let x of data) {
     let id = x.Id
     let msg = x.message
     if(id == genId){
         genId = Id();
     }
     if(message?.startsWith("*") ? message?.split("*").slice(1).join(" "): message == msg) {
         return submitted.reply({content: `هذا الرد موجود مسبقا`, ephemeral: true}) 
     }
 }
        }
    let newResponse = {
        Id: genId,
        guildId: submitted.guild.id,
        author: submitted.member.id,
        message: message?.startsWith("*") ? message?.split("*").slice(1).join(" "): message,
        response: [],
        reply: reply_type,
        wildcard: message?.startsWith("*")
    }
    newResponse.response.push(response1)
    if(response2.length){
        newResponse.response.push(response2)
    }
    if(response3.length){
        newResponse.response.push(response3)
    }
    if(response4.length){
        newResponse.response.push(response4)
    }
    
    db.push(`auto-response`, newResponse)
    
    
    const embed = new MessageEmbed()
    
    .addField("الرد الجديد", `${newResponse.message}`)
    .addField("الايدي", `||${genId}||`)
    .setColor("GREEN")
    await submitted.reply({embeds: [embed], content: `تم اضافة الرد بنجاح ✅`})
  
}

            
    } else if(subcmd == "remove"){
       let ID = options.getString("id")
 let data = db.get(`auto-response`)
   if(!db.has("auto-response")) return interaction.reply({content: "لا يوجد هناك ردود لحذفها", ephemeral: true});
 for(let x of data) {
     let index = data.indexOf(x);
     let id = x.Id;
     if(ID == id){
         if(index !== -1){
             data.splice(index, 1)
             db.set("auto-response", data)
             interaction.reply({content: "تم حذف الرد بنجاح ✅", ephemeral: true})
         } else {
             interaction.reply({content: "خطأ في حذف الرد ربما هذا الرد لم يعد متاح", ephemeral: true})
         } 
        } else 
        interaction.reply({content: "خطأ في حذف الرد ربما هذا الرد لم يعد متاح", ephemeral: true})
      }
   
        
        
   
} else if(subcmd == "list"){
     if (!db.has("auto-response")) {
            await interaction.reply({ content: 'لم يتم العثور على اي ردود تلقائية', ephemeral: true });
            return;
        }

      
        let data = db.get("auto-response");

   
        data = data.filter(entry => entry.guildId === interaction.guild.id);

        
        if (data.length === 0) {
            await interaction.reply({ content: 'لم يتم العثور على ردود تلقائية لهذا السيرفر', ephemeral: true });
            return;
        }

        
        const jsonData = JSON.stringify(data, null, 2);
       
        const fileBuffer = Buffer.from(jsonData, 'utf-8');
      
        const file = new MessageAttachment(fileBuffer, 'responses.txt');
    
        await interaction.reply({ content: 'ملف الردود التلقائية المسجلة 📃', files: [file], ephemeral: true });
     }   
    }
});

client.on("messageCreate", async message => {
    
    if(!db.has("auto-response")) return;
    let data = db.get("auto-response")
    for(let x of data){
        let guild_id = x.guildId;
        let msg = x.message;
        let response = x.response;
        let reply = x.reply;
        let wildcard = x.wildcard;
        let random = Math.floor(Math.random() * x.response.length);
        let RandomRes = response[random];
if(message.guild.id == guild_id){
    

        if(message.author.bot) return;
if (RandomRes.includes("[user]")) {
        RandomRes = RandomRes.replace("[user]", `<@${message.author.id}>`);
    }
    if (RandomRes.includes("[userName]")) {
        RandomRes = RandomRes.replace("[userName]", message.author.username);
    }
    if (RandomRes.includes("[userId]")) {
        RandomRes = RandomRes.replace("[userId]", message.author.id);
    }
    if (RandomRes.includes("[userAvatar]")) {
        RandomRes = RandomRes.replace("[userAvatar]", message.author.displayAvatarURL({ dynamic: true, format: "png" }));
           }
        if(!wildcard && message.content == msg){
        if(reply == "true"){
    message.reply(`${RandomRes}`)
          } else {
   message.channel.send(`${RandomRes}`)
          }
        } else if(wildcard && message.content.includes(msg)){
        if(reply == "true"){
     message.reply(`${RandomRes}`)
          } else {    message.channel.send(`${RandomRes}`)
          }
    }
        }
}
})


function Id(minLength = 9, maxLength = 13) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));

    }
    return result;
}

client.login(token);