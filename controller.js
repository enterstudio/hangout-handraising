var participants = [];		//people currently running an instance of the hangout
var queue = [];				//list of participant ids waiting to speak. 0 is the current speaker
var timeOut = -1;			//unix time of when the current speaker's turn will end
var currentSpeakerId = -1;		//id of the current speaker; on updates if it doesn't match queue, manager sets new time

var greenDot = gapi.hangout.av.effects.createImageResource('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB90BDwMNIxL4LdEAAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAAuNJREFUeNrtmy2M2mAYx3/tTsxchliWnDi1kAxBhsE0aTBkbkPg0Ljhlp1CYnF3Dj03wbBnSJOaMywTXLKcOkGyICBnJrhsog9Lj7Xlo3y078s/qSx9/z+e9/N5XoMdy3Z5BpwBOaAgTw44B14CM2AC3ANDYCDPEBg5Fo+7bJ+xI9MvgBJQB97H/Lke0AH6jsU0sQBsFwMoAs0tmI6C0QJuHIs/iQAgxsvAFwnpfWgM1IDruCCMmObfAl+B1xxGd0DVsfi+VwC2y3MJxU8kQ22g6Vj83jkA2+UN8AM4IVmaAXnH4nadl8w1zX+Q6Slp5pE2DaWN2wdgu3wEuiRfXWnr9gDYLp+BS9KjS2lz/DFAaKbJvF8Nx+JqYwDSn7qkWxXH4tvaAGS0H6KGcmGzgxExzz8kdLTfdIo8DVonhA2CLYXMz6fI1koRIMvbAWqqsLhsNgI2Nj8PuLbfx94h699ALXaBssLmEW/lwAiQf//XHre0h9IYeDWPAn8EFDUwj3gsBnWBJvqo+aQLyBneBL2UcSym8wgooZ9K/i5Q1xBAHcCQc/sZeurExEta6KozEy9Lo6tyJl6qSlcVjgCOXcDL0uqqcxPIaAwgY6K5TA33AH5NTLzKDF11b6LO0fcmGpqoewC6igZHAMcuACONAYxMqcPraWi+51g8zhdCHQ0BdOYLIYC+hgD6/wBIBWZPs/Cf+iMAQrKniqrl3wvMdYOXNlJdY/H6FIDkymoaAKhFZYev8VLIqupOPBIIQMhUFQZQXSyu/u9ARCoo2gqabwcVVYedCDVRK1s0IyT7HQhAqqnyCgHIh1WSh54JSl1dRQHzlagK8shDUamwbKTYfCOqSnQpAIFwBVyk0PzFsjphWOPCRMqKphurmF8LgEBIQ/F0ZVnYbwxAIOh7ZcY3O5wmbLHUxiuGvl33Re2vzcXKDcqHs8C7PW+lx/LNbBzzsSNgIRr0vDobAkO/y9MRMBJ9ff4vhV3btM/DqFkAAAAASUVORK5CYII=');
var greenDotOverlay = greenDot.createOverlay(
	{'scale':
		{'magnitude': 0.15, 'reference': gapi.hangout.av.effects.ScaleReference.WIDTH}});

var yellowDot = gapi.hangout.av.effects.createImageResource('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB90BDwMXCA5pLkoAAAAdaVRYdENvbW1lbnQAAAAAAENyZWF0ZWQgd2l0aCBHSU1QZC5lBwAAAuFJREFUeNrtmyts21AUhj97BiPVCiZLBUVzpAVUKykuqca2gLDgsoVNKwoMDWtZ8NhAFloSXJJpIJXmooJIVkCjkoFbbcAnk5vZzsN52Pfml8yS+P5fzn2ecy3WrMB3XgAHQBk4lqcMHAKvAQU8APfAAOjLMwCGrqee1tk+a02mXwGnwDnwIePPdYE20HM9Nc4tgMB3LOAEaKzAdBqMJnDjeupPLgCI8TPgq4T0JjQCasB1VhBWRvPvgG/AG7ajO6DqeurHRgEEvvNSQvEz+VALaLie+r12AIHvvAV+Ag75kgKOXE/dLvIle0HzH2V6ypt5pE0DaePqAQS+8wnokH91pK2rAxD4zhfgkuLoUtqcfQwQmkUyH1Xd9dTV0gCkP3Uotiqup74vDEBG+wF6qJw0O1gp8/xjTkf7ZafIvbh1QtIg2NTI/GSKbM4VAbK87aOnjqeXzVbMxubXFtf2m9g7lKIbqOkucKaxecTbWWwEyL8fbHBLuy2NAHcSBdEIODHAPOLxJK4LNDBHjWddQM7wHjBL+66nxpMIOMU8nUa7wLmBAM4BLDm3V5gpxyZMWpiqA5swS2OqyjZhqspUHe8A7LpAmKU1VYc2sG8wgH0bw2UbuAeI6sEmrMwwVfc2+hx9L6OBjb4HoPOovwOw6wIwNBjA0JY6vK6B5ruup54mC6G2gQDak4UQQM9AAL1/AKQCs2tY+I+jEQAJ2VNN1YzuBSa6IUwb6a6ReH0OQHJlNQMA1NKyw9eEKWRddSceiQUgZKoaA6hOF1f/dyAiFRQtDc234oqqd0VScZ+WDx5p9O8fJVWSJ54JSl1dRQPzlbQK8tRDUamwrBfYfD2tSnQmAIFwBVwU0PzFrDrhxEEwYWAsUtF0fR7zCwEQCEUonq7MCvulAQgEc6/MRGaHvZwtlloyz98u+kXjr81lyg3Ki0vA+w1vpUfyzlIW85kjYCoazLw6mwDDvMvTKTByfX3+L4KL/xorzXR/AAAAAElFTkSuQmCC');
	var yellowDotOverlay = yellowDot.createOverlay(
	{'scale':
		{'magnitude': 0.15, 'reference': gapi.hangout.av.effects.ScaleReference.WIDTH}});

var buttonDisabled = false;	//true when button is clicked to prevent joining the queue several times

gapi.hangout.onApiReady.add(function(eventObj){
	if (eventObj.isApiReady) {
		buttonDisabled = false;
		participants = gapi.hangout.getEnabledParticipants();
		onDataChange();

		gapi.hangout.onParticipantsChanged.add(onParticipantsChange);
		gapi.hangout.data.onStateChanged.add(onDataChange);

		setInterval(updateTimeOutText, 200);
	}
});

function onParticipantsChange() {
	participants = gapi.hangout.getEnabledParticipants();

	onServerUpdate();
};

function onDataChange (){
	var state = gapi.hangout.data.getState();
	if (!(typeof state.queue === "undefined")){
		queue = JSON.parse(state.queue);
		if (queue.length > 0 && queue [0] != currentSpeakerId){
			console.log("new speaker");
			timeOut = new Date().getTime() + 1000*60;
			currentSpeakerID = queue[0]
		}
		else {
			console.log("speaker is the same");
		}
	}
	else{
		console.log("queue not updated");
	}

	// //timeOut set to -1 if not defined
	// if (typeof state.timeOut === "undefined" || typeof state.timeOut === "undefined"){
	// 	console.log('valid timeouts not found');
	// 	timeOut = -1;
	// }
	// else{
	// 	var serverTime = JSON.parse(state.timeOut);
	// 	if (Math.abs(serverTime - (timeOut - new Date().getTime()) > 2000){
	// 		console.log("time dif, updating local time from " + timeOut + " to " + serverTime);
	// 		timeOut = serverTime + new Date().getTime();
	// 	}
	// 	else {
	// 		console.log("time dif small not updating from " + timeOut + " to " + serverTime);
	// 	}
	// }
	
	onServerUpdate();
}

function onServerUpdate(){
	console.log("onServerUpdate called");
	buttonDisabled = false;
	printParticipants();
	clearOverlay();
	var queuePosition = queue.indexOf(gapi.hangout.getParticipantId());
	if (queuePosition == 0){
		placeGreenDot();
		document.getElementById('queueButton').innerHTML = "I Am Done";
	}
	else if (queuePosition > 0){
		placeYellowDot();
		document.getElementById('queueButton').innerHTML = "Put Hand Down";
	}
	else{
		document.getElementById('queueButton').innerHTML = "Raise My Hand";
	}

	//lowest order participant manages time updates 
	//and checks for disconnected queue memembers
	if (isManager()){
		console.log("managing update...");
		var validSpeaker = false;
		var updateRequired = false;
		while (queue.length > 0 && !validSpeaker){

			var speakerInHangout = false;
			for (var i = 0; i < participants.length; i++){
				if (participants[i].id == queue[0]){
					if (!participants[i].hasAppEnabled){
						console.log("speaker doesn't have app on");
						queue.shift();
						updateRequired = true;
						speakerInHangout = true;
					}
					else{
						console.log("speaker running app");
						validSpeaker = true;
						speakerInHangout = true;
					}
				}
			}
			if (!speakerInHangout){
				console.log("speaker not in hangout");
				queue.shift();
				updateRequire = true;
			}
		}
		// if (timeOut == -1 || new Date().getTime() > timeOut){
		// 	console.log('new timeout value required');
		// 	updateRequired = true;
		// }
		if (updateRequired){
			console.log("sending new update");
			sendNewSpeaker();
		}
		else{
			console.log("no update required");
		}
	}
}

//sends queue and updated timestamps
function sendNewSpeaker(){
	timeOut = new Date().getTime() + 1000*60;
	gapi.hangout.data.submitDelta({	'queue':JSON.stringify(queue)});
}

function printParticipants(){
	if (queue.length > 0){
		document.getElementById('speakerName').innerHTML = getParticipantNameById(queue[0]);
		document.getElementById('speakerDisplay').style.display = 'inline';
	}
	else {
		document.getElementById('speakerDisplay').style.display = 'none';
	}

	var queueHTML = ""
	if (queue.length > 1){
		for (var i = 1; i < queue.length; i++){
			queueHTML = queueHTML + getParticipantNameById(queue[i]) + '</br>';
		}	
		document.getElementById('queueMembers').innerHTML = queueHTML;
		document.getElementById('queueMembers').style.display = 'inline';
	}
	else {
		document.getElementById('queueMembers').style.display = 'none';
	}

	var memberHTML = "";
	for (var i = 0; i < participants.length; i++){
		if (queue.indexOf(participants[i].id) == -1){
			memberHTML = memberHTML + participants[i].person.displayName + '</br>';
		}
	}
	document.getElementById('otherParticipants').innerHTML = memberHTML;
} 

function getParticipantNameById(id){
	for (var i = 0; i < participants.length; i++){
		if (participants[i].id == id){
			return participants[i].person.displayName;
		}
	}
	return '';
}

function buttonClick(){
	if (!buttonDisabled){
		buttonDisabled = true;
		var queuePosition = queue.indexOf(gapi.hangout.getParticipantId());
		if (queuePosition != -1){
			queue.splice(queuePosition, queuePosition + 1);
			gapi.hangout.data.submitDelta({'queue':JSON.stringify(queue)});
		}
		else {
			queue.push(gapi.hangout.getParticipantId());	
			gapi.hangout.data.submitDelta({'queue':JSON.stringify(queue)});
		}
	}
}

function placeGreenDot(){
	greenDotOverlay.setPosition(.4, -.35);
	greenDotOverlay.setVisible(true);
}

function placeYellowDot(){
	yellowDotOverlay.setPosition(.4, -.35);
	yellowDotOverlay.setVisible(true);	
}

function clearOverlay(){
	greenDotOverlay.setVisible(false);
	yellowDotOverlay.setVisible(false);
}

//only one participant should be manager; this code might need updating
//might not be necessary at all - ok to send multiple identical updates
function isManager(){
	return true;
	return (participants[0].id == gapi.hangout.getParticipantId());
}

//what happens if manager is alt tabbed?
function updateTimeOutText(){
	if (timeOut != -1 && queue.length > 0){
		var timeDif = timeOut - new Date().getTime();
		document.getElementById('timeLeft').innerHTML = '  - ' + Math.max(0, Math.round(timeDif/1000)) + ' secounds';
		if (isManager() && timeDif < 0 || timeDif < 2000){
			console.log("Time up!");
			//force update iff queue is empty 
			if (queue.length > 1){
				queue.shift();
			}
			sendNewSpeaker();
		}
	}
	else{
		document.getElementById('timeLeft').innerHTML = '';
	}
}