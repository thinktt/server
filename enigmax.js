var crypto = require('crypto'); 

/*try {
  var buf = crypto.randomBytes(32);
  console.log(buf.length, buf.readUInt32BE(0));
} catch (ex) {
  // handle error
  console.log('most likely, entropy sources are drained'); 
}*/


//.......................Rotor prototype..........................
function Rotor(subSet) {

	//the input output set is just the regular non moving alphabet
	var ioSet =        "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	//the basic set is matched to the substitution set to caculate the ofsets of the rotor
	//it rotates with the subsitution set
	var basicSet   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	//               "EKMFLGDQVZNTOWYHXUSPAIBRCJ";

	//tells us what's in the ring window and
	//when we're at our turnover
	var ringSet =  "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

	//retrieve the notch setting and chop off the setting from the substitution set
	var notch = subSet[26];
	subSet = subSet.slice(0, 26);

	//stores outputs sent from the rotor functions
	var output;


	//these four functions are for looking at the internal state of the rotor
	this.getBasicSet = function() {
		return basicSet;
	};

	this.getSubSet = function() {
		return subSet;
	};

	this.getRingSet = function() {
		return ringSet;
	};

	this.getNotch = function(){
		return notch;
	};

	//takes an input char to the rotor and returns an output char
	this.getSubChar = function(input){
		output = ioSet[ basicSet.indexOf( subSet[ ioSet.indexOf(input) ] ) ];
		return output;
	};

	// takes a reverse input char to the rotor and returns an output char
	this.getRevSubChar = function(input){
		output = ioSet[ subSet.indexOf( basicSet[ ioSet.indexOf(input) ] ) ];
		return output;

	};

	//rotates the rotor one click
	this.rotate = function(){
		ringSet = ringSet + ringSet[0];
		ringSet = ringSet.slice(1);
		basicSet = basicSet + basicSet[0];
		basicSet = basicSet.slice(1);
		subSet = subSet + subSet[0];
		subSet = subSet.slice(1);
	};

	//used to tell if the notch has been passed
	this.checkNotch = function(){
		if(ringSet[25] === notch) {
			output =  true;
		}
		else {
			output = false;
		}

		return output;
	};

	//used to tell if notch is about to be passed
	//useful for double stepping feature
	this.checkPreNotch = function() {
		if(ringSet[0] === notch){
			output = true;
		}
		else {
			output = false;
		}

		return output;
	};

	this.setStartPosition = function(input){
		while(ringSet[0] !== input) {
			this.rotate();
		}
	};

	this.setRing = function(input) {

		//rotate the ring set until it matches the
		//input setting, if it never matches exit the loop
		var x = 0;
		while(ringSet[0] !== input && x < 26) {
			ringSet = ringSet + ringSet[0];
			ringSet = ringSet.slice(1);
			x++;
		}

	};





}

//................Enigma Core Machine prototype..................................
function EnigmaCore() {

	var rotorArray = [];
	var startSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var basicSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var plugboard ="LPGSZMHAEOQKVXRFYBUTNICJDW";
	var ringSet = "";

	//double is step used for the regular enigma
	//double stepping feature
	var doubleStepOn = false;

	this.turnOnDoubleStep = function() {
		doubleStepOn = true;
	};

	this.turnOffDoubleStep = function() {
		doubleStepOn = false;
	};


	//loads a new rotor Array into the machine
	this.loadRotors = function(inputRotorArray){
		rotorArray = inputRotorArray();

	};

	//sets all the rotors to their start positions specified in startSet
	this.setRotors = function() {

		//console.log(rotorArray[0].getBasicSet());
		//console.log(rotorArray.length);
		
		
		for(var i=0; i< rotorArray.length; i++) {
			rotorArray[i].setStartPosition(startSet[i]);
			//console.log(rotorArray[i].getBasicSet());
		}
	};

	this.setRings = function() {

		for(var i=0; i< rotorArray.length; i++) {
			rotorArray[i].setRing(ringSet[i]);
			//console.log(rotorArray[i].getRingSet());
		}
	};


	//loads a new rotor start positions into the machine
	this.loadStartSet= function(inputStartSet){
		startSet = inputStartSet;
	};

	//logs info about state of core machine
	//used for testing purposes
	this.getState = function() {
		var position ="";
		var notchState = "";
		for(x = 0; x < rotorArray.length; x++) {
			position = position + rotorArray[x].getBasicSet()[0];
			notchState = notchState + rotorArray[x].checkNotch();
		}
		return position;
		//console.log("notch:"+ notchState);
		//console.log(rotorArray[0].checkNotch());
	};



	//rotates rotor one and any rotors that are currently notched
	var rotate = function() {

		//if second rotor is right before it's notch hit it
		//it should go ahead and rotate (if doubletep is on)
		if(doubleStepOn && rotorArray[1].checkPreNotch()) {
			rotorArray[1].rotate();
			rotorArray[2].rotate();
		}

		var x = 0;
		do
		{
			rotorArray[x].rotate();
			x++;
		}
		while(x < rotorArray.length && rotorArray[x-1].checkNotch());



	};

	//for testing the rotate function
	this.rotateTest = function(rotateNum){
		for(var x = 0; x < rotateNum; x++) {
			rotate();
		}

	};

	//feeds a charachter through the machine and returns the result
	this.getSubChar = function(input){

		//used as return variable and in below loop
		var output;

		//rotate rotor 0 and notched rotors
		rotate();

		//feed input charachter through all rotors
		for(var x =0; x< rotorArray.length; x++) {
			output = rotorArray[x].getSubChar(input);
			input = output;
		}

		return output;
	};

	//reverse feeeds a charachter through the machine and returns the result
	this.getRevSubChar =function(input){

		//used as return variable and in below loop
		var output;

		//rotate rotor 0 and notched rotors
		rotate();

		//feed charchater backward through all rotors
		for(var x =(rotorArray.length -1); x >= 0; x--) {
			output = rotorArray[x].getRevSubChar(input);
			input = output;
		}

		return output;
	};


	//encrypt an input string
	this.encrypt = function(inputMessage){
		var outputMessage = "";

		//console.log("Input Message:     " + inputMessage);

		//put message through plugboard
		outputMessage = this.plugboardIn(inputMessage);
		inputMessage = outputMessage;
		outputMessage="";

		//console.log("Plugboard message: " + inputMessage);

		//feeds inputMessage through machine and fills outputMessage
		for(var i = 0; i < inputMessage.length; i++) {
			//take next characther from the message
			input = inputMessage[i];
			//feed charachter through machine
			output = this.getSubChar(input);
			//add output charachter to the output message
			outputMessage = outputMessage + output;
		}

		//console.log("Final Message:     " + outputMessage);

		return outputMessage;
	};


	//decrypt an input string
	this.decrypt = function(inputMessage){
		var outputMessage = "";

		//reverse feeds inputMessage through machine and fills outputMessage
		for(var i = 0; i < inputMessage.length; i++) {
			//take next characther from the message
			input = inputMessage[i];
			//feed charachter through machine
			output = this.getRevSubChar(input);
			//add output charachter to the output message
			outputMessage = outputMessage + output;
		}


		//reverse message through plugboard
		inputMessage = outputMessage;
		outputMessage = this.plugboardOut(inputMessage);


		return outputMessage;
	};




	//takes a rotor set and builds a rotor Array that can be passed to EX Machine
	this.buildRotorArray = function(rotorSet) {

		var basicSet =    "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

		var rotorBlock =  "LPGSZMHAEOQKVXRFYBUTNICJDWY\n" +
						  "SLVGBTFXJQOHEWIRZYAMKPCNDUE\n" +
						  "CJGDPSHKTURAWZXFMYNQOBVLIEN\n" +
						  "PEZUOHXSCVFMTBGLRINQJWAYDKY\n" +
						  "ZOUESYDKFWPCIQXHMVBLGNJRATE\n" +
						  "EHRVXGAOBQUSIMZFLYNWKTPDJCN\n" +
						  "JGDQOXUSCAMIFRVTPNEWKBLZYHN\n" +
						  "NTZPSFBOKMWRCJDIVLAEYUXHGQE\n" +
						  "JVIUBHTCDYAKEQZPOSGXNRMWFLY\n" +
						  "EKMFLGDQVZNTOWYHXUSPAIBRCJQ\n" +
						  "AJDKSIRUXBLHWTMCQGZNPYFVOEE\n" +
						  "BDFHJLCPRTXVZNYEIWGAKMUSQOV\n" +
						  "ESOVPZJAYQUIRHXLNFTGKDCMWBJ\n" +
						  "VZBRGITYUPSDNHLXAWMJQOFECKZ\n" +
						  "LVAWDKEJGMIHORNSQYPBZCFTXUQ\n" +
						  "WYKEXFINHQOPJRLTMSACVGBUZDV\n" +
						  "WTOKASUYVRBXJHQCPZEFMDINLGQ\n" +
						  "GJLPUBSWEMCTQVHXAOFZDRKYNIE\n" +
						  "JWFMHNBPUSDYTIXVZGRQLAOEKCV\n" +
						  "FGZJMVXEPBWSHQTLIUDYKCNRAOJ\n" +
						  "HEJXQOTZBVFDASCILWPGYNMURKZ\n" +
						  "KEDXVBSQHNCZTRUFLOAYWIPMJGF\n" +
						  "NUJPHWFMGDOBAVZQTXECLKYSIRO\n" +
						  "CIAHFQOYBXNUWJLVGEMSZKPDTRZ\n" +
						  "FKOQBLHNAPWDRUYSVGJEXMTCZIY\n" +
						  "VMWJNPAUTIFXBYGDZCRQKHOLSEE\n";

		var rotorSettingArray = rotorBlock.split("\n");
		var rotorArray = [];

		//takes given rotor choice and find it in the rotorSettingArray
		//adding it to the rotor set
		for(var i=0; i < rotorSet.length; i++){
			rotorArray[i] = new Rotor(rotorSettingArray[basicSet.indexOf(rotorSet[i])]);

			//console.log(rotorArray[i].getSubSet());
		}

		return rotorArray;
	};


	//takes a set of letters, builds a rotor set from it and loads it in the machine
	this.loadRotorSet = function(rotorSet) {
		rotorArray = this.buildRotorArray(rotorSet);
	};

	//loads an enigma core key with all it's parts
	this.setKey = function(key) {
		var rotorSet = key.rotorSet;
		this.loadRotorSet(rotorSet);
		startSet = key.startSet;
		plugboard = key.plugboard;
		ringSet = key.ringSet;

		//console.log(rotorSet);
		//console.log(startSet);
		//console.log(plugboard);

	};


	//simple plugboard substitution
	this.plugboardIn = function(input) {
		output = "";

		for(var i=0; i<input.length; i++){
			output = output + plugboard[basicSet.indexOf(input[i])];
		}
		return output;
	};

	//simple reverse plugboard substitution
	this.plugboardOut = function(input) {
		output = "";

		for(var i=0; i<input.length; i++){
			output = output + basicSet[plugboard.indexOf(input[i])];
		}
		return output;
	};

	//test the pluboard to make sure it has
	//all 26 letters of the aphabet
	this.plugsAreGood = function(plugboard) {
		var basicSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var output = true;

		//check for all letters of the alphabet
		for(var i=0; i< 26; i++)
		{
			if( plugboard.indexOf(basicSet[i]) === -1) {
				output = false;
			}
		}

		return output;
	};

	//when new machine made set default rotors
	this.loadRotorSet("ABCDEFGHIJKLMNOPQRSTUVWXYZ");


	//when machine starts set default startSet;
	startSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


	//when new machine made set rotor array to the startset
	this.setRotors();


}


//...............Enigma Regular Prototype.....................
function EnigmaRegular() {

	var enigmaCore = new EnigmaCore();
	enigmaCore.turnOnDoubleStep();

	//default key
	var key = {
		rotorSet: "JKL",
		startSet: "AAA",
		ringSet:  "AAA",
		plugboard: "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
	};

	//reflector built from a non moving rotor
	var reflector = new Rotor("YRUHQSLDPXNGOKMIEBFZCWVJATA");


	//takes a message string and pushes
	//through the relector
	reflector.getSubStr = function(message) {
		var output = "";
		for(var i=0; i < message.length; i++){
			output = output +this.getSubChar(message[i]);
		}
		return output;
	};

	//takes a message string and reverse
	//pushes it through the reflector
	reflector.getRevSubStr = function(message) {
		var output = "";
		for(var i=0; i < message.length; i++){
			output = output +this.getRevSubChar(message[i]);
		}
		return output;

	};


	this.crypt = function(message) {

		//convert everything to uppercase
		message = message.toUpperCase();

		//find any enigma charachters (alphabet)
		message = message.match(/[A-Z]/g);


		if(message !== null) {

			//turn message back in to a single string
			message = message.join('');

			//set the rotors to their start position
			enigmaCore.setRotors();

			//push through rotors
			message = enigmaCore.encrypt(message);

			//push through reflector
			message = reflector.getSubStr(message);

			//reset rotors
			enigmaCore.setRotors();

			//reverse push through rotors
			message = enigmaCore.decrypt(message);
		}
		else {
			message = "invalid\0";
		}

		return message;
	};

	//takes a key object and set it in enigmaCore
	this.setKey = function(key){

		var revKey = {rotorSet:"", startSet:"", ringSet:"", plugboard:""};

		//rotors are in reverse order in Enigma Regular vs
		//Enigma Core, this reverses them
		revKey.rotorSet = key.rotorSet.split("").reverse().join("");
		revKey.startSet = key.startSet.split("").reverse().join("");
		revKey.ringSet = key.ringSet.split("").reverse().join("");
		revKey.plugboard = key.plugboard;


		enigmaCore.setKey(revKey);
		enigmaCore.setRings();
	};

	this.loadKey = function(keyString) {

		var output = "";

		//convert keystring to uppercase
		keyString = keyString.toUpperCase();

		//capture only the key part
		keyString = keyString.match(/[A-Z]{3}-[A-Z]{3}-[A-Z]{3}-[A-Z]{26}/);

		//if keystring was not found
		if(keyString === null) {
			output="invalid\0";
		}
		//break the key down and check the plugboard
		else {
			keyString = keyString[0];
			keyString = keyString.split('\n');
			keyString = keyString[0].split('-');

			key.rotorSet = keyString[0];
			key.startSet = keyString[1];
			key.ringSet = keyString[2];
			key.plugboard = keyString[3];


			//if pluboard is good set the key
			if(enigmaCore.plugsAreGood(key.plugboard)){
				output ="rotors:"+ key.rotorSet + '\n' +
						"start:" + key.startSet + " rings:" + key.ringSet + '\n' +
						"plugboard:" + key.plugboard;

				enigmaRegular.setKey(key);
			}
			else {
				output="invalid\0";
			}
		}

		return output;
	};

	//set the default settings on new Enigma Regular
	this.setKey(key);
}


//................ASCII / Enigma Code Converter prototype.....................
function AsciiEnigmaConverter() {

	//takes an ASCII char and returns two enigma machine chars
	var toEnigmaChar = function(input) {

		var output = "";
		var basicSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var charCode = input.charCodeAt();
		var remainder = charCode % 26;
		var quotient = (charCode - remainder) / 26;

		if(quotient > 25) {
			quotient = 25;
			remainder = 25;
		}

		output = basicSet[quotient] + basicSet[remainder];

		//console.log(charCode, quotient, remainder, output);

		return output;

	};


	//takes two enigma machine chars and returns an ASCII char
	var toAsciiChar = function(input) {

		var output ="";
		var basicSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
		var firstCharNum = basicSet.indexOf(input[0]);
		var secondCharNum = basicSet.indexOf(input[1]);
		var charCode = (firstCharNum * 26) + (secondCharNum);
		output = String.fromCharCode(charCode);

		//console.log(firstCharNum, secondCharNum, charCode, output);

		return output;

	};

	//takes a string of ASCII chars and returns enigma code
	this.toEnigmaCode = function(input) {

		var output = "";

		//get enigma codes for each ASCII char
		for(var i=0; i < input.length; i++) {
		 output = output + toEnigmaChar(input[i]);
		}

		return output;
	};

	//takes enigma codes and returns ASCII chars
	this.toAsciiCode = function(input) {
		var output = "";

		//get ASCII char for each set of enigma codes
		for(var i=0; i < input.length; i=i+2) {
		 //console.log(input.substr(i,2));
		 output = output + toAsciiChar(input.substr(i,2));
		}

		return output;
	};



}


//....................Think Ding Converter prototype.....................
function ThinkDinger() {

	var basicSet =    "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var thinkDingSet ="♆☢♗☯☠✈♞❂☭✂☏☾♠✿☮❉♕✪♙☸☹✸♬★♖☂";

	var output = "";

	//converts Enigma Code to Think Ding code
	this.toThinkDing = function(input) {
		output = "";

		for(var i=0; i<input.length; i++){
			output = output + thinkDingSet[basicSet.indexOf(input[i])];
		}
		return output;
	};

	//converts Think Ding Code to Enigma Code
	this.toEnigmaCode = function(input) {
		output = "";

		for(var i=0; i<input.length; i++){
			output = output + basicSet[thinkDingSet.indexOf(input[i])];
		}
		return output;
	};
}


//......................String Tester Prototype................
function StringTester() {

	var basicSet =    "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var thinkDingSet ="♆☢♗☯☠✈♞❂☭✂☏☾♠✿☮❉♕✪♙☸☹✸♬★♖☂";



	this.isEnigmaCode = function(input) {

		for(var i=0; i<input.length; i++){
		 // this function needs fixin, does nothin righ tnow
		 // but is not being used by enigmaX
		}
	};

	//test to make sure string is in ascii range
	this.isAsciiCode = function(input) {
		var output = true;


		//note this is testing for my ascii range not real ascii range
		for(var i=0; i<input.length; i++){
			if(input.charCodeAt(i) > 675) {
				output = false;
				break;
			}
		}

		return output;
	};

	//checks if string is composed of thinkDingChars
	this.isThinkDing = function(input) {
		var output = true;

		for(var i=0; i<input.length; i++){
			if(thinkDingSet.indexOf(input[i]) === -1){
				output = false;
				break;
			}
		}

		return output;
	};


}

//..............Random Generator Protoype.............
function RandomGen()
{
	//0 to 4294967295 - range of a 32 bit integer- (2^32)-1
	var max32BitInt = 4294967295;
	//holds 100 sjcl random numbers
	//this.randomArray = sjcl.random.randomWords(100);

	//gets a random 32 bit positive integer
	this.getRandom32BitInt= function() {

		/*
		//get random number from randomArray
		var randomNum = this.randomArray.shift();
		//console.log(randomNum);

		//if random array is now empty reload it
		if(this.randomArray.length === 0) {
			this.randomArray = sjcl.random.randomWords(100);
		}

		//if random number is negative convert it to a postive
		//integer without creating a bit bias
		if(randomNum < 0) {
			randomNum = Math.abs(randomNum);
			randomNum = randomNum + 0x80000000;
		}
		*/
		
		//get 32 random bits and convert them to a number
		//using nodes crypto library instead of sjcl
		var randomNum = crypto.randomBytes(32).readUInt32BE(0); 

		//breaking the random to test this without sjcl
		//var randomNum = 10;

		return randomNum;
	};

	//gets a random int from 0 to specified range
	this.getRandomNum =function(range) {
		var randomNum = 0;

		//gets number and puts it in range, if out
		//of distribution range throw out and try again
		do {
			randomNum = this.getRandom32BitInt();
			randomNum = toRange(randomNum, range);
		} while (randomNum === null);

		return randomNum;
	};

	//takes a 32 bit integer and retunrs a number in a range from 0 to range
	//specified, returning null for numbers that would creat an uneven distribution
	var toRange =function(number, range) {

		var output = 0;
		//add 1 so number%range returns numbers up to range
		range++;

		//get the range  within max32BitInt for an even distribution
		var maxForEvenDist = (max32BitInt - (max32BitInt % range)) -1;
		//console.log("evenDistRange: "+ evenDistRange);

		if(number > maxForEvenDist) {
			output = null;
		}
		else {
			output = number % range;
		}

		return output;
	};

	this.toRange = toRange;


	//test toRange function checking for even distribution
	this.testDist = function() {
		var array = [];
		var exceptionCount = 0;
		var range = 0;

		//test value since real value is not testable
		max32BitInt = 6000;


		for(var i = 0; i <=max32BitInt; i++) {

			if(toRange(i, range) !== null ) {
				if(array[toRange(i, range)] === null) {
					array[toRange(i, range)] = 1;
				}
				else {
					array[toRange(i, range)] = array[toRange(i, range)] + 1;
				}
			}
			else {
				exceptionCount++;
			}
		}

		//console.log(array);
		//console.log(exceptionCount);

		//return max32BitInt to it's correct value
		max32BitInt = 4294967295;

	};

}

//............Key Generator Prototype..............
function KeyGen() {

	var randomGen = new RandomGen();
	var basicSet   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";


	this.getKey = function(){
		var key = {rotorSet: "", startSet: "", plugboard: ""};

		for(var i = 0; i<26; i++) {
			key.rotorSet = key.rotorSet + basicSet[randomGen.getRandomNum(25)];
		}

		for(var i = 0; i<26; i++) {
			key.startSet = key.startSet + basicSet[randomGen.getRandomNum(25)];
		}

		var randomChar = "";
		for(var i = 25; i>=0; i--) {
			randomNum = randomGen.getRandomNum(i);
			randomChar= basicSet[randomNum];
			key.plugboard = key.plugboard + randomChar;
			basicSet = basicSet.replace(randomChar,'');
		}
		basicSet   = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

		return key;
	};

	this.getTinyKey = function() {
		var tinyKey = { rotorSet: "", startSet: "", plugboard: basicSet};

		for(var i = 0; i<3; i++) {
			tinyKey.rotorSet = tinyKey.rotorSet + basicSet[randomGen.getRandomNum(25)];
		}

		for(var i = 0; i<3; i++) {
			tinyKey.startSet = tinyKey.startSet + basicSet[randomGen.getRandomNum(25)];
		}

		return tinyKey;
	};

}


//...........EnigmaX Machine Prototype.............
function EnigmaXMachine(){

	var basicSet   =     "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
	var inputMessage = "";
	var outputMessage ="";

	//build all components of the machine
	var enigmaCore = new EnigmaCore();
	var enigmaTiny = new EnigmaCore();
	var aeConverter = new AsciiEnigmaConverter();
	var tdConverter = new ThinkDinger();
	var sTester = new StringTester();
	var keyGen = new KeyGen();
	var tinyKey = keyGen.getTinyKey();



	//generate a random enigmaCore key
	var key = keyGen.getKey();
	//set the key in the core machine
	enigmaCore.setKey(key);
	//enigmaX key in thinkDing
	var thinkDingKey ="";

	this.newKey = function() {
		//generate a new enigma key
		key = keyGen.getKey();
		//set key in enigma core machine
		enigmaCore.setKey(key);

		//translate to a thinkDing key
		thinkDingKey =  tdConverter.toThinkDing(key.rotorSet) + '\n' +
						tdConverter.toThinkDing(key.startSet) + '\n' +
						tdConverter.toThinkDing(key.plugboard);

		//return the thinkDing version
		return thinkDingKey;

	};


	//load a thinkDing key into the machine
	this.loadKey = function(keyString) {

		var output ="";
		//thinkDing key will hold 78 thinkDing Chars
		var thinkDingKey ="";

		//find any thinkDing chars and put them in the thinkDing
		//string until it reaches 78 chars or end of string is reached
		for(var i=0; thinkDingKey.length < 78 &&  i < keyString.length; i++) {
			if(sTester.isThinkDing(keyString[i])) {
				thinkDingKey = thinkDingKey + keyString[i];
			}
		}

		if(thinkDingKey.length < 78) {
			output = "invalid\0";
		}
		else {

			key.rotorSet = tdConverter.toEnigmaCode(thinkDingKey.substr(0, 26));
			key.startSet = tdConverter.toEnigmaCode(thinkDingKey.substr(26, 26));
			key.plugboard = tdConverter.toEnigmaCode(thinkDingKey.substr(52, 26));



			output =    thinkDingKey.substr(0, 26) + '\n' +
						thinkDingKey.substr(26, 26) + '\n' +
						thinkDingKey.substr(52, 26);
		}


		//finally check the plugboard to make sure it's
		//good then set the key in Enigma Core
		if(enigmaCore.plugsAreGood(key.plugboard)){
			enigmaCore.setKey(key);
		}
		else {
			output = "invalid\0";
		}

		return output;
	};
	
	//process thinkDing Keys for encryption 
	var processTDKeys = function(message) {
			
		var startsWithNewLine = false; 
		
		//capture first thinkDing key in the message
		var group = /((\n|^)([♆☢♗☯☠✈♞❂☭✂☏☾♠✿☮❉♕✪♙☸☹✸♬★♖☂]{26})(?=\n|$)){3}/.exec(message);

		//do while the thinkDing group has actually captured something
		while(group !== null) {
			//strip regex down to just the string
			group = group[0]; 
			//console.log(group); 
			
			//take note if the group starts with a new line
			if(group[0] === "\n") {startsWithNewLine = true;}
			
			//remove all endline chars and create one string
			group = group.replace(/\n/g, ""); 
			//console.log(group);
			
			//convert to Enigma Code
			group = tdConverter.toEnigmaCode(group); 
			//console.log(group);
			
			//convert to ascii
			group = aeConverter.toAsciiCode(group);
			//console.log(group);
			
			//add escape slashes to any slash or end brackets
			group = group.replace(/\\/g, "\\\\");
			group = group.replace(/]/g, "\\]");
			//console.log(group);
			
			//add group brackets with key code (ʡ)
			group = "ʡ[" + group + "]"; 
			//console.log(group);
			
			//if group started with a new line add it back in now
			if(startsWithNewLine) {group = "\n" + group;} 
			
			//replace the thinkDing key with coded brackeded ascii
			message = message.replace(/((\n|^)([♆☢♗☯☠✈♞❂☭✂☏☾♠✿☮❉♕✪♙☸☹✸♬★♖☂]{26})(?=\n|$)){3}/, group); 
					
			//capture the next thinkDing key
			group = /((\n|^)([♆☢♗☯☠✈♞❂☭✂☏☾♠✿☮❉♕✪♙☸☹✸♬★♖☂]{26})(?=\n|$)){3}/.exec(message);
		}

		return message; 
	};

	
	//process bracketed thinkDing for encryption (to re-encrypt thinkDing)
	var processTDGroups = function(message) {
			
		//capture first thinkDing group in message
		var group = /\[[♆☢♗☯☠✈♞❂☭✂☏☾♠✿☮❉♕✪♙☸☹✸♬★♖☂]+\]/.exec(message);

		//do while the thinkDing group has actually captured something
		while(group !== null) {
			//strip the group down to just the thinkDing group
			group = group[0]; 
			//srtip the group down further to just inner thinkDing string
			group = group.substring(1, group.length-1);
			//convert to Enigma Code
			group = tdConverter.toEnigmaCode(group); 
			//convert to bracketed ascii
			//if length of string is odd add an extra Z and code for odd string (ʢ)
			//add escape slashes to any slash or end brackets
			if(group.length % 2 === 1) {
				group =  group + "Z";
				group = aeConverter.toAsciiCode(group); 
				group = group.replace(/\\/g, "\\\\");
				group = group.replace(/]/g, "\\]");
				group = "ʢ[" + group + "]"; 
			} 
			else {
				group = aeConverter.toAsciiCode(group); 
				group = group.replace(/\\/g, "\\\\");
				group = group.replace(/]/g, "\\]");
				group = "ʣ[" + group + "]"; 
			}
			//replace brackeded thinkDing with coded brackeded ascii
			message = message.replace(/\[[♆☢♗☯☠✈♞❂☭✂☏☾♠✿☮❉♕✪♙☸☹✸♬★♖☂]+\]/, group); 
			//capture the next thinkDing group
			group = /\[[♆☢♗☯☠✈♞❂☭✂☏☾♠✿☮❉♕✪♙☸☹✸♬★♖☂]+\]/.exec(message);
		}

		return message; 
		
	};

	//processes decrypted ascii groups that need to be turned back into thinkDing
	var processAsciiGroups = function(message) {

		var groupCode = ""; 

		//capture the first group in the message
		var group = /[ʣʢʡ](\[)((?=(\\?))\3[\u0000-\u02A3])*?]/.exec(message);

		while(group !== null) {
			//strip down to just the group
			group = group[0];
			//capture the group code
			groupCode = group[0];
			//strip group down to just the inner ascii
			group = group.substring(2, group.length-1);
			//replace all escaped slashes
			group = group.replace(/\\\\/g, "\\");
			group = group.replace(/\\]/g, "]");
			//convert to enigma code
			group = aeConverter.toEnigmaCode(group); 
			
		
			//if group was coded as odd 
			if(groupCode === "ʢ") {
				//remove last Enigma char
				group = group.substring(0, group.length-1);
				//convert to thinkDing
				group = tdConverter.toThinkDing(group); 
				//add brackets 
				group = "[" + group + "]";
			}
			//if group is coded as a key 
			else if (groupCode === "ʡ") {
				//convert to thinkDing
				group = tdConverter.toThinkDing(group); 
				//format as key
				group = group.substr(0, 26) + '\n' +
						group.substr(26, 26) + '\n' +
						group.substr(52, 26);
			}
			//otherwise just convert it and add the brackets
			else {
				//convert to thinkDing
				group = tdConverter.toThinkDing(group); 
				//add brackets 
				group = "[" + group + "]";
			}
			

			//replace coded bracketed ascii with bracketed thinkDing or tdKey
			message = message.replace(/[ʣʢʡ](\[)((?=(\\?))\3[\u0000-\u02A3])*?]/, group); 
			
			//caputre the next group
			group = /[ʣʢʡ](\[)((?=(\\?))\3[\u0000-\u02A3])*?]/.exec(message);
		}

		return message; 
	};



	//encrypt-decrypt a message
	this.crypt = function(inputMessage){
	
		var startMessage = inputMessage;
		
		//process any thinkDing keys for re-encryption
		inputMessage = processTDKeys(inputMessage);
		
		//process any bracket thinkDing groups for re-encryption
		inputMessage = processTDGroups(inputMessage);
		
		//test that algorithms are working in symetrical fashion
		//console.log(processAsciiGroups(inputMessage) === startMessage); 

		//check if message is ascii
		if(sTester.isAsciiCode(inputMessage)) {

			//convert the message to Enigma usalbe code
			outputMessage = aeConverter.toEnigmaCode(inputMessage);
			inputMessage = outputMessage;


			//generate a message key and load it into enigmaTiny
			tinyKey = keyGen.getTinyKey();
			enigmaTiny.setKey(tinyKey);

			//push message through enigmaTiny
			enigmaTiny.setRotors();
			outputMessage = enigmaTiny.encrypt(inputMessage);

			//append tiny key to message
			outputMessage = tinyKey.rotorSet + tinyKey.startSet + outputMessage;
			inputMessage = outputMessage;


			//push the message through the enigma core machine
			enigmaCore.setRotors();
			outputMessage = enigmaCore.encrypt(inputMessage);


			//append version code
			inputMessage = "GG" + outputMessage;

			//convert the message to thinkDing code
			outputMessage = tdConverter.toThinkDing(inputMessage);



		}
		else {
			
			//strip all spaces and new lines from the message
			inputMessage = inputMessage.replace(/[\n\r\uFEFF ]/g, ""); 
			
			//check if message is thinkDing and has the min start chars
			if(sTester.isThinkDing(inputMessage) && inputMessage.length >= 10) {

				//convert message from thinkDing to Enigma code
				outputMessage = tdConverter.toEnigmaCode(inputMessage);


				//remove version code
				inputMessage = outputMessage.substr(2);

				//push Enigma code backward through the machine
				enigmaCore.setRotors();
				outputMessage = enigmaCore.decrypt(inputMessage);


				//extract and remove tiny key from message
				tinyKey.rotorSet = outputMessage.substr(0,3);
				tinyKey.startSet = outputMessage.substr(3,3);
				tinyKey.plugboard = basicSet;
				inputMessage = outputMessage.substr(6);

				//set enigmaTiny key
				enigmaTiny.setKey(tinyKey);

				//push message backward through enigmaTiny
				enigmaTiny.setRotors();
				outputMessage = enigmaTiny.decrypt(inputMessage);
				inputMessage = outputMessage;

				
				//convert Enigma code to ASCII code
				outputMessage = aeConverter.toAsciiCode(inputMessage);
			
				//procecc any bracketed ASCII groups back to thinkDing
				outputMessage = processAsciiGroups(outputMessage); 
				
			}
			//if message is not thinkDing or ascii, or is to short
			else {
				outputMessage = "invalid\0";
			}
		}
		
		return outputMessage;
	};


}




//.......................The Program......................

module.exports = new EnigmaXMachine();