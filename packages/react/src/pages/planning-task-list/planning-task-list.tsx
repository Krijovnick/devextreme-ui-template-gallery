import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Workbook } from 'exceljs';
import { saveAs } from 'file-saver-es';

import Toolbar, { Item } from 'devextreme-react/toolbar';
import DataGrid from 'devextreme-react/data-grid';
import Sortable from 'devextreme-react/sortable';
import Gantt from 'devextreme-react/gantt';
import { exportGantt as exportGanttToPdf } from 'devextreme/pdf_exporter';
import { exportDataGrid } from 'devextreme/pdf_exporter';
import { exportDataGrid as exportDataGridXSLX } from 'devextreme/excel_exporter';
import LoadPanel from 'devextreme-react/load-panel';

import dxTextBox from 'devextreme/ui/text_box';

import { PlanningGrid, PlanningKanban, PlanningGantt, FormPopup, TaskFormDetails } from '../../components';

import { newTask } from '../../shared/constants';
import { useScreenSize } from '../../utils/media-query';

import { getTasks, getFilteredTasks } from 'dx-template-gallery-data';

import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

import './planning-task-list.scss';
import Button from 'devextreme-react/button';
import TextBox from 'devextreme-react/text-box';
import Tabs from 'devextreme-react/tabs';

const listsData = ['LIST', 'KANBAN BOARD', 'GANTT'];

export const PlanningTaskList = () => {
  const gridRef = useRef<DataGrid>(null);
  const kanbanRef = useRef<Sortable>(null);
  const ganttRef = useRef<Gantt>(null);

  const [listView, kanbanView, ganttView] = listsData;

  const [view, setView] = useState(listView);
  const [index, setIndex] = useState(0);
  const [gridData, setGridData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newTaskData, setNewTaskData] = useState(newTask);
  const [popupVisible, setPopupVisible] = useState(false);

  const { isXSmall } = useScreenSize();

  const isDataGrid = view === listView;
  const isKanban = view === kanbanView;

  useEffect(() => {
    Promise.all([
      getTasks()
        .then((data) => setGridData(data)),
      getFilteredTasks()
        .then((data) => setFilteredData(data))
    ]).catch((error) => console.log(error));
  }, []);

  useEffect(() => {
    if (filteredData.length && gridData.length) {
      setLoading(false);
    }
  }, [filteredData, gridData]);

  const onDataChanged = useCallback(data => {
    setNewTaskData(data);
  }, []);

  const onTabClick = useCallback((e: { itemData?: string }) => {
    setView(e.itemData || '');
    setIndex(listsData.findIndex((d) => d === e.itemData));
  }, []);

  const changePopupVisibility = useCallback(() => {
    setPopupVisible(!popupVisible);
  }, [popupVisible]);

  const refresh = useCallback(() => {
    if (isDataGrid) {
      gridRef.current?.instance.refresh();
    } else if (isKanban) {
      kanbanRef.current?.instance.update();
    } else {
      ganttRef.current?.instance.refresh();
    }
  }, [view]);

  const showColumnChooser = useCallback(() => {
    gridRef.current?.instance.showColumnChooser();
  }, []);

  const exportToPDF = useCallback(() => {
    if (isDataGrid) {
      const doc = new jsPDF();
      exportDataGrid({
        jsPDFDocument: doc,
        component: gridRef.current?.instance,
      }).then(() => {
        doc.save('Tasks.pdf');
      });
    } else {
      exportGanttToPdf(
        {
          component: ganttRef.current?.instance,
          createDocumentMethod: (args) => new jsPDF(args),
        },
      ).then((doc) => doc.save('gantt.pdf'));
    }
  }, [view]);

  const exportToXSLX = useCallback(() => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet('Main sheet');

    exportDataGridXSLX({
      component: gridRef.current?.instance,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer) => {
        saveAs(new Blob([buffer], { type: 'application/octet-stream' }), 'DataGrid.xlsx');
      });
    });
  }, []);

  const search = useCallback((e: { component: dxTextBox }) => {
    gridRef.current?.instance.searchByText(e.component.option('text') ?? '');
  }, []);

  const getTabsWidth = useCallback(() => {
    return isXSmall ? 220 : 'auto';
  }, []);

  return (
    <div className='view-wrapper view-wrapper-list'>
      <Toolbar className='toolbar-common'>
        <Item location='before'>
          <span className='toolbar-header'>Tasks</span>
        </Item>
        <Item
          location='before'
          widget='dxTabs'
        >
          <Tabs
            dataSource={listsData}
            width={getTabsWidth()}
            selectedIndex={index}
            scrollByContent
            showNavButtons={false}
            onItemClick={onTabClick}
          />
        </Item>
        <Item
          location='after'
          widget='dxButton'
          locateInMenu='auto'
        >
          <Button
            icon='plus'
            text='Add Task'
            type='default'
            stylingMode='contained'
            onClick={changePopupVisibility}
          />
        </Item>
        <Item
          location='after'
          widget='dxButton'
          showText='inMenu'
          locateInMenu='auto'
        >
          <Button
            icon='refresh'
            text='Refresh'
            stylingMode='text'
            onClick={refresh}
          />
        </Item>
        <Item
          location='after'
          widget='dxButton'
          showText='inMenu'
          locateInMenu='auto'
          disabled={view !== listView}
        >
          <Button
            icon='columnchooser'
            text='Column Chooser'
            stylingMode='text'
            onClick={showColumnChooser}
          />
        </Item>
        <Item location='after' locateInMenu='auto'>
          <div className='separator' />
        </Item>
        <Item
          location='after'
          widget='dxButton'
          showText='inMenu'
          locateInMenu='auto'
          disabled={isKanban}

        >
          <Button
            icon='exportpdf'
            text='Export To PDF'
            stylingMode='text'
            onClick={exportToPDF}
          />
        </Item>
        <Item
          location='after'
          widget='dxButton'
          showText='inMenu'
          locateInMenu='auto'
          disabled={view !== listView}
        >
          <Button
            icon='exportxlsx'
            text='Export To XSLX'
            stylingMode='text'
            onClick={exportToXSLX}
          />
        </Item>
        <Item
          location='after'
          widget='dxTextBox'
          locateInMenu='auto'
          disabled={view !== listView}
        >
          <TextBox
            mode='search'
            placeholder='Task Search'
            onInput={search}
          />
        </Item>
      </Toolbar>
      {loading && <LoadPanel container='.content' visible position={{ of: '.content' }} />}
      {!loading && isDataGrid && <PlanningGrid dataSource={gridData} ref={gridRef} />}
      {!loading && isKanban && <PlanningKanban dataSource={filteredData} ref={kanbanRef} changePopupVisibility={changePopupVisibility} />}
      {!loading && view === ganttView && <PlanningGantt dataSource={filteredData} ref={ganttRef} />}
      <FormPopup title='New Task' visible={popupVisible} changeVisibility={changePopupVisibility}>
        <TaskFormDetails colCountByScreen={{ xs: 1, sm: 1 }} subjectField data={newTaskData} editing onDataChanged={onDataChanged} />
      </FormPopup>
    </div>
  );
};
