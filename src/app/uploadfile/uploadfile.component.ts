import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AbstractControl, ControlContainer, FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
  colunasdefault : any[] = []
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
    ,
    {
      "nameexcel": "coluna6",
      "nametable": "Coluna 6",
      "isreadOnly": "false"
    }
  ]

  form : any;
  data!: AOA
	wopts: XLSX.WritingOptions = { bookType: 'xlsx', type: 'array' };
	fileName: string = 'SheetJS.xlsx';
  constructor(private fb : FormBuilder) { }

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
      console.log("DIFF", this.headerIsComplete(this.colunasdefault,this.data[0]))
      if(this.headerIsComplete(this.colunasdefault,this.data[0])){
        this.getColumnDefault()
        this.loadform(this.data)
        this.dataSource = new MatTableDataSource((this.form.get('deals') as FormArray).controls);
        console.log("dataSource",this.dataSource)
      }
    };
    reader.readAsBinaryString(target.files[0]);
  }

  getColumnDefault(){
    this.colunas.forEach((coluna : any) => {
      this.colunasdefault.push(coluna.nameexcel)
    });
  }

  loadform(dados: any){
    // this.colunas.forEach((coluna : any) => {
    //   coluna.index = dados[0].indexOf(coluna.nameexcel)
    //   console.log(coluna.nameexcel,dados[0].indexOf(coluna.nameexcel))
    // });

    // console.log("colunaaaa", this.colunas);

    // this.colunas.sort(function (a : any, b: any) {
    //   if (a.index > b.index) {
    //     return 1;
    //   }
    //   if (a.index < b.index) {
    //     return -1;
    //   }
    //   // a must be equal to b
    //   return 0;
    // });

    // console.log("colunaBBBBBBBBBBBB", this.colunas);
    // this.colunas.forEach((coluna : any) => {
    //   this.colunasdefault.push(coluna.nameexcel)
    // });

    // for (let index = 1; index < dados.length; index++) {
    //   const line = dados[index];
    //   this.form.get('deals').push(new FormGroup({
    //     coluna1 : new FormControl(line[0], [Validators.required]),
    //     coluna2 : new FormControl(line[1], [Validators.required]),
    //     coluna3 : new FormControl(line[2], [Validators.required]),
    //     coluna4 : new FormControl(line[3], [Validators.required]),
    //     coluna5 : new FormControl(line[4], [Validators.required]),
    //   }))
    //   console.log("Line", line[0])



    for (let index = 1; index < dados.length; index++) {
      const line = dados[index];
      var teste = dados[0][0];
      this.form.get('deals').push(this.mountFormGoup(dados, line))

    console.log("FORM", this.form)
    this.mountFormGoup(dados, line)

    }

  }

  mountFormGoup(dados: any[][], line : any){
    let obj : any = {} ;
    for (let index = 0; index < dados[0][0].length; index++) {
      obj[dados[0][index]] = new FormControl(line[index], Validators.required);
    }
    return this.fb.group(obj)
  }

  headerIsComplete (a1 : any[], a2 : any[]) {

    let intersectionA = a1.filter(x=> a2.includes(x))
    let diferenceA = a1.filter(x => !intersectionA.includes(x))
    console.log("DIFF", diferenceA.length);

    if (diferenceA.length === 0){
      return true
    }
    else {
      return false
    }



  }

  public checkError = (controlName: string, errorName: string, element : FormGroup) => {
    return element.controls[controlName].hasError(errorName);
  }

}
