import React, { Component } from 'react';
const link = "/Der_Bachelor";
class InfoRequest extends Component {

    constructor() {
        super();
        this.state = { data: ["Loading..."] };
    }

    componentDidMount() {
        this.GetHtmlCode();
    }

    GatherSeasonInformations() {
        const c = this.FindSeasons();
        const d = this.FindSeasonsInformation(c);
        var b = this.ExtractInfos(d);
        const a = this.CleanEntrys(b)
        // console.log(a)
    }

    GetHtmlCode() {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', link, true);
        xhr.addEventListener('load', () => {
            this.setState({ data: xhr.responseText });
            // this.setState({ data: "Loaded!" });
            this.GatherSeasonInformations();
        })
        xhr.send();
    }

    CleanEntrys(entrys) {
        var cleanEntrys = [];
        entrys.forEach(element => {
            //name ist schon fertig
            var seasonName = element.name;
            element.table = this.CleanTableInformation(element.table);
            const kandidateInformation = "";
            const infos = "";
            //table als nächstes
            // element.infos = this.CleanInfoInformation(element.info);
            //danach infos
            const cleanEntry = [{ seasonName, kandidateInformation, infos }]
            cleanEntrys.push(cleanEntry);
        });
        return cleanEntrys;
    }

    CleanTableInformation(tableEntry) {
        /*
            Es gibt -> 
            Namen | alter | Wohnort | beruf & Anmerkungen | rausflug  
            stehen für jeden in EINER tr 
        */
        var name, age, wohnort, beruf, exit;
        var tableEntrys = this.SplitTableEntry(tableEntry);
        tableEntrys.forEach(element => {
            element = this.CleanElement(element);
            if (element.substring(0, 20).includes('<span')) {
                name = this.CutOutSpanName(element);
                element = this.CutNameSpanEntry(element);
            } else if (element.substring(0, 20).includes('a href')) {
                name = this.CutOutRefName(element);
                element = element.substring(element.indexOf('/td>') + 4);
            } else {
                name = this.CutOutInfo(element);
                element = this.CutElementEntry(element, name.length + 10);
            }
            age = this.CutOutInfo(element);
            element = this.CutElementEntry(element, age.length + 12);
            var answer = this.GetWohnort(element);
            if (answer.href) {
                element = this.CutOutInfoWhenRef(element);
                wohnort = answer.wohnort;
            } else {
                wohnort = answer;
                element = this.CutElementEntry(element, wohnort.length + 8);
            }
            // console.log('Element nach wohnort -> \n' + element)
            beruf = this.GetBeruf(element);
            console.log(new String(name + ' ' + age + ' ' + wohnort + ' ' + beruf).replace(/[\n\r]/g, ''));
        });
    }

    CleanElement(e) {
        e = e.replace("&#160;", ' ');
        e = e.replace('<b>', '')
        e = e.replace('</b>', '')
        e = e.replace('<i>', '')
        e = e.replace('</i>', '')
        e = e.replace('&amp;', '&');
        e = e.replace('&#91;15&#93;&#91;16&#93;','')
        return e
    }

    CutOutRefName(e) {
        e = e.substring(4, e.indexOf('/td>') - 5)
        const start = e.indexOf('>') + 1;
        const end = e.indexOf('<', 10);
        const name = e.substring(start, end);
        return name;

    }

    GetBeruf(e) {
        if (e.includes('<a href')) {
            e = e.substring(4);
            e = e.substring(0, e.indexOf('</td>'))
            return this.CutBeruf(e);
        } else {
            const a = e.indexOf('<');
            e = e.substring(a);
            var t = e.substring(4, e.indexOf('/td>') - 1)
            return t;
        }
    }

    CutNameSpanEntry(e) {
        return e.substring(e.indexOf('</span>') + 14, e.length)
    }

    CutOutSpanName(e) {
        e = e.substring(4);
        e = e.substring(e.indexOf('>') + 1, e.length)
        return e.substring(0, e.indexOf('<'));
    }

    CutOutInfoWhenRef(e) {
        e = e.substring(5);
        const start = e.indexOf('td>');
        const end = e.indexOf('<');
        if (start < end) {
            start = 0;
        }
        return e.substring(start, e.length)
    }

    CutBeruf(e) {
        let sliceStart = e.indexOf('<');
        let sliceEnd = e.indexOf('>');
        if (sliceStart > sliceEnd) {
            sliceStart = 0;
        }
        let test2 = e.slice(sliceStart, sliceEnd + 1);
        var txt = e.replace(test2, '');
        e = txt;
        if (e.includes('<')) {
            return this.CutBeruf(e)
        }
        return e;
    }


    GetWohnort(e) {
        if (e.substring(0, 15).includes('href')) {
            const wohnort = this.CutRefPlace(e);
            return { href: true, wohnort: wohnort }
        } else {
            return this.CutOutInfo(e);
        }

    }

    CutRefPlace(e) {
        const cutted = 11;
        const shadowE = e.substring(cutted);
        return this.CutOutInfo(shadowE);
    }


    CutElementEntry(e, i) {
        return e.substring(i);
    }

    CutOutInfo(e) {
        // let startCut = e.indexOf('>');
        // let endCut = e.indexOf('<');
        // const test = e.slice(startCut,endCut);
        // return test;
        let start = -1;
        for (let i = 0; i < e.length; i++) {
            if (e.charAt(i).includes('>')) {
                start = i + 1;
            }
            if (start > 0 && e.charAt(i).includes('<')) {
                const info = e.substring(start, i);
                return info;
            }
        }
    }

    SplitTableEntry(table) {
        var entrys = [];
        var start;
        for (let i = 0; i < table.length; i++) {
            var word = table.substring(i, i + 4);
            if (word.includes('<tr>')) {
                start = i;
            }
            if (word.includes('/tr>')) {
                const tableEntry = table.substring(start + 5, i - 1)
                entrys.push(tableEntry);
            }
        }
        const cleanEntrys = entrys.slice(2, entrys.length)
        return cleanEntrys;
    }

    FindSeasons() {
        const expression = /id=".{1,10}_Staffel"/;
        const flags = "gm";
        var regex = new RegExp(expression, flags);
        var results = this.state.data.match(regex);
        return this.DeleteFirstEntry(results);


    }

    FindSeasonsInformation(startingPointArray) {
        var infos = [];
        const a = ".{11500}";
        startingPointArray.forEach(element => {
            const rx = new RegExp(element + a, 'gs');
            var info = rx.exec(this.state.data)
            info = this.TrimmToTable(info.toString());
            infos.push(info);
        });
        return infos;
    }

    DeleteFirstEntry(results) {
        return results.slice(1, results.length);
    }

    TrimmToTable(info) {
        //</table> -> 8 buchstaben 
        for (let i = info.length; i > 0; i--) {
            let word = info.substring(i - 8, i);
            if (word.includes("</table>")) {
                return info.slice(0, i);
            }
        }
        console.log(info)
        return info
    }

    ExtractInfos(infos) {
        var splittetInformations = []
        const NameTextLength = 180;
        console.log(infos)
        infos.forEach(element => {
            if (element) {

                var text = element;
                const name = this.GetName(text.substring(0, NameTextLength));//Erhält die ersten 100 zeichen -> sollte eigentlich sicher sein 
                text = text.substring(NameTextLength, text.length);
                const seasonTable = this.GetParticipatesTable(text); //hier kann ich von hinten nach vorne suchen
                text = text.substring(0, (text.length - seasonTable.toString().length))
                const seasonInformation = this.GetSeasonInfo(text);
                // console.log(seasonInformation)
                splittetInformations.push({ name: name, table: seasonTable, infos: seasonInformation });
            }
        });
        return splittetInformations;
    }

    GetSeasonInfo(info) {
        if (info.includes('<ul')) {
            info = this.DeleteUl(info);
        }
        const rx = new RegExp('.*/h3>', 's');
        const a = rx.exec(info);
        return info.substring(a.toString().length + 1, info.length)

    }

    DeleteUl(info) {
        const rx = new RegExp('<ul.*/ul>', 's');
        var result = rx.exec(info);
        const start = info.substring(0, result.index - 1);
        const end = info.substring(result.index + result.toString().length);
        return start + end
    }

    GetParticipatesTable(info) {
        const rx = new RegExp('<table.*</table>', 's');
        return rx.exec(info).toString();
    }

    GetName(t) {
        var startpoint;
        for (let i = 0; i < t.length; i++) {
            if (t.charAt(i) === '>') {
                startpoint = i + 1;
            }
            if (t.charAt(i) === '<') {
                return t.substring(startpoint, i);

            }
        }
    }

    render() {
        return (
            <h5>{this.state.data}</h5>
        )
    }


}


export default InfoRequest;
