import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx'

type AOA = any[][];

@Component({
  selector: 'app-uploadfile',
  templateUrl: './uploadfile.component.html',
  styleUrls: ['./uploadfile.component.css']
})
export class UploadfileComponent implements OnInit {

  titulo = 'teste excel';
  file!:File;
  arrayBuffer : any
  filelist : any
  colunasdefault : any[] = ["coluna1","coluna2","coluna3", "coluna4","coluna5"];
  dataSource!: MatTableDataSource<any>;

  colunas : any = [
    {
      "nameexcel": "coluna1",
      "nametable": "Coluna 1",
      "isreadOnly": "true"

    },
    {
      "nameexcel": "coluna2",
      "nametable": "Coluna 2",
      "isreadOnly": "false"
    },
    {
      "nameexcel": "coluna3",
      "nametable": "Coluna 3",
      "isreadOnly": "false"
    },
    {
      "nameexcel": "coluna4",
      "nametable": "Coluna 4",
      "isreadOnly": "false"
    },
    {
      "nameexcel": "coluna5",
      "nametable": "Coluna 5",
      "isreadOnly": "false"
    }

  ]


  form : any;


  data!: AOA
	wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
	fileName: string = 'SheetJS.xlsx';
  constructor() { }

  ngOnInit(): void {
    this.form = new FormGroup({deals : new FormArray([])})

  }

  addfile(event : any)
  {
  this.file= event.target.files[0];
  let fileReader = new FileReader();
  fileReader.readAsArrayBuffer(this.file);
  fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for(var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, {type:"binary"});
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      console.log(XLSX.utils.sheet_to_json(worksheet,{header:1}));
      console.log(XLSX.utils.sheet_to_json(worksheet,{raw:true}));
        var arraylist = XLSX.utils.sheet_to_json(worksheet,{raw:true});
            this.filelist = [];
            console.log(this.filelist)

  }
  }

  onFileChange(evt: any) {
    /* wire up file reader */
    const target: DataTransfer = <DataTransfer>(evt.target);
    if (target.files.length !== 1) throw new Error('Cannot use multiple files');
    const reader: FileReader = new FileReader();
    reader.onload = (e: any) => {
      /* read workbook */
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, {type: 'binary'});

      /* grab first sheet */
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      /* save data */
      this.data = <AOA>(XLSX.utils.sheet_to_json(ws, {header: 1}));

      /* Validação colunas*/
      console.log(this.header_diff(this.colunasdefault,this.data[0]))

      console.log(this.data)

      this.loadform(this.data)

      this.dataSource = new MatTableDataSource((this.form.get('deals') as FormArray).controls);
      console.log(this.dataSource)

    };
    reader.readAsBinaryString(target.files[0]);
  }

  loadform(dados: any){
    for (let index = 1; index < dados.length; index++) {
      const line = dados[index];
      this.form.get('deals').push(new FormGroup({
        coluna1 : new FormControl(line[0], [Validators.required]),
        coluna2 : new FormControl(line[1], [Validators.required]),
        coluna3 : new FormControl(line[2], [Validators.required]),
        coluna4 : new FormControl(line[3], [Validators.required]),
        coluna5 : new FormControl(line[4], [Validators.required]),
      }))
      console.log("Line", line[0])
    console.log("FORM", this.form)
    }


    // this.ToDoListForm.get(‘items’).push(new FormGroup({
    //   title:new FormControl(dat[x].title,[Validators.required]),
    //   completed:new FormControl(dat[x].completed,[Validators.required]),
    //   priority:new FormControl(dat[x].priority,[Validators.required])
    //   }))
  }

  header_diff (a1 : any[], a2 : any[]) {

    let intersectionA = a1.filter(x=> a2.includes(x))
    let diferenceA = a1.filter(x => !intersectionA.includes(x))

    return diferenceA;
  }

  public checkError = (controlName: string, errorName: string, element : FormGroup) => {
    //return this.addShopFormGroup.controls[controlName].hasError(errorName);
    console.log("controlName:", controlName, " errorName:", errorName, " Value:", element.controls[controlName].value);
    console.log("Element:", element.controls[controlName].hasError(errorName));
    console.log("Element:", element.controls[controlName]);
    return element.controls[controlName].hasError(errorName);
  }

}
