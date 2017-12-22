
const nfcCard = require('./lib/nfccard-tool');

const { NFC } = require('nfc-pcsc');

const nfc = new NFC(); // optionally you can pass logger

nfc.on('reader', reader => {

	// disable auto processing
	reader.autoProcessing = false;

	console.log(`${reader.reader.name}  device attached`);

	// needed for reading tags emulated with Android HCE
	// custom AID, change according to your Android for tag emulation
	// see https://developer.android.com/guide/topics/connectivity/nfc/hce.html
	// reader.aid = 'F222222222';



  reader.on('card', async card => {

      console.log();
      console.log(`card detected`, card);

      // example reading 12 bytes assuming containing text in utf8
      try {

        
        /**
         *  Read block 0 to 6 in order to parse tag information
         */
        const blocks0to6 = await reader.read(0, 23); // starts reading in block 0 until 6

        const tag = nfcCard.parseInfo(blocks0to6);
        console.log('tag info:', tag);

        /**
         *  Read the NDEF message and parse it if it's supposed there is one
         */

        if(nfcCard.isFormatedAsNDEF() && nfcCard.hasReadPermissions() && nfcCard.hasNDEFMessage()) {


          /**
           * Get NDEF MESSAGE as buffer
           */
          const NDEFRawMessage = await reader.read(4, nfcCard.getNDEFMessageLengthToRead()); // starts reading in block 0 until 6
          console.log('NDEFMessage:', NDEFRawMessage);

          console.log('nfcCard.parseNDEF(NDEFRawMessage): ', nfcCard.parseNDEF(NDEFRawMessage));
        }



      } catch (err) {
        console.error(`error when reading data`, err);
      }


    });

	reader.on('card.off', card => {
		console.log(`${reader.reader.name}  card removed`, card);
	});

	reader.on('error', err => {
		console.log(`${reader.reader.name}  an error occurred`, err);
	});

	reader.on('end', () => {
		console.log(`${reader.reader.name}  device removed`);
	});

});

nfc.on('error', err => {
	console.log('an error occurred', err);
});
