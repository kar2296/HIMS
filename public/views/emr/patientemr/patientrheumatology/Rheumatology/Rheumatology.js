function saveRheumatology(status) {
    var basePath = sessionStorage.getItem('base-path');
    var annotations = $('img').mapster('get');
    var selectedItems = annotations.split(',');
    var List = [];
    selectedItems.forEach(function(area){
        var item = { name : area, idList: []};
        var chkboxList = $('input[name=' + area +']');
        chkboxList.each(function() {		
            var isChecked = $(this).is(':checked');
            if(isChecked) {
                item.idList.push({id: this.id});
            }
        });
        List.push(item);
    });
    var patientId = sessionStorage.getItem('EMRPatientId');
    var encounterId = getEncounterId();
    var rheumatologyId = sessionStorage.getItem('patient-rheumatology-id');
    var consultationId = sessionStorage.getItem('consultation-id');
    var name = $('#name').val();
    var comments = $('#comment-val').val();

    var actionURL = basePath + 'emr/PatientRheumatology/AddPatientRheumatology';

    if(rheumatologyId && rheumatologyId > 0) {
        actionURL = basePath + 'emr/PatientRheumatology/UpdatePatientRheumatology'
    }

    var inputData = { Data: { Id: parseInt(rheumatologyId), ConsultationId: consultationId,EncounterId: encounterId ,PatientId: patientId, Name: name, 
                            RheumatologyStatusId: status, Comments: comments,  Annotations: JSON.stringify({List}) }};
	$.ajax({
    type: "POST",
    url: actionURL,
    dataType: "json",
    contentType: "application/json; charset=utf-8",
    data: JSON.stringify(inputData),
    success: function(data) {
        if(data && !rheumatologyId) {
            sessionStorage.setItem('patient-rheumatology-id', data);
        }
    }
    });
}

function getRheumatology() {
    var basePath = sessionStorage.getItem('base-path');
    var patientId = sessionStorage.getItem('EMRPatientId');
    var rheumatologyId = sessionStorage.getItem('patient-rheumatology-id');
    var consultationId = sessionStorage.getItem('consultation-id');

    //fetch data by rheumatology id
    if(rheumatologyId && rheumatologyId > 0) {
        var actionURL = basePath + 'emr/PatientRheumatology/GetPatientRheumatologyById';

        var inputData = { Id: parseInt(rheumatologyId), PatientId: patientId };
        $.ajax({
        type: "POST",
        url: actionURL,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(inputData),
        success: function(data) {
            if(data) {
                applyAnnotations(data.Annotations);
                $('#name').val(data.Name);
                $('#comment-val').val(data.Comments);
            }            
        }
        });
    }
    else
    //fetch data using consultation id
    if(consultationId && consultationId > 0) {
        var actionURL = basePath + 'emr/PatientRheumatology/GetPatientRheumatologys';

        var inputData = { Params: [ {Key: 2, Value: parseInt(consultationId)}, {Key: 3, Value: patientId}],
                          PageContext:{
                            PageSize: 25,
                            PageNumber: 1
                        } };
        $.ajax({
        type: "POST",
        url: actionURL,
        dataType: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(inputData),
        success: function(data) {            
            if(data.Data[0]) {
                var item = data.Data[0];
                applyAnnotations(item.Annotations);
                $('#name').val(item.Name);
                $('#comment-val').val(item.Comments);
                sessionStorage.setItem('patient-rheumatology-id', item.Id);
            }
        }
        });
    }

}

function applyAnnotations(data) {
    var annotations = JSON.parse(data);
    annotations.List.forEach(function(item){
        $('#body_hand_foot_image').mapster('set', true, item.name);
        item.idList.forEach(function(a){
            $('#'+a.id).prop('checked', true);
        });
    });    
}

function getEncounterId() {
    var encounterJSON = sessionStorage.getItem('EMR-CURRENT-ENCOUNTER');
    if (encounterJSON) {
        var encounter = JSON.parse(encounterJSON);
        return encounter.Id;
    } else {
        return null;
    }
}