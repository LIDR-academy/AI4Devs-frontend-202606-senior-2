import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PositionCard } from './positions/PositionCard';
import { DashboardActionCard } from './dashboard/DashboardActionCard';
import FileUploader from './FileUploader';
test('position action emits its real ID',()=>{const onOpen=jest.fn();render(<PositionCard position={{id:42,title:'Frontend',company:'LTI',deadline:'Sin fecha',status:'Abierto'}} onOpen={onOpen}/>);fireEvent.click(screen.getByText('Ver proceso'));expect(onOpen).toHaveBeenCalledWith(42);});
test('dashboard action is one accessible link',()=>{render(<MemoryRouter><DashboardActionCard title="Posiciones" label="Abrir" href="/positions"/></MemoryRouter>);expect(screen.getByRole('link',{name:'Abrir'})).toHaveAttribute('href','/positions');expect(screen.queryByRole('button')).not.toBeInTheDocument();});
test('cancelled selection preserves prior file and errors are visible',async()=>{const upload=jest.fn().mockRejectedValue(new Error('Falló la subida'));const onUpload=jest.fn();render(<FileUploader upload={upload} onUpload={onUpload}/>);const input=screen.getByLabelText('Archivo CV');const file=new File(['demo'],'demo.pdf',{type:'application/pdf'});fireEvent.change(input,{target:{files:[file]}});fireEvent.change(input,{target:{files:[]}});expect(screen.getByText(/demo.pdf/)).toBeVisible();fireEvent.click(screen.getByText('Subir Archivo'));expect(await screen.findByRole('alert')).toHaveTextContent('Falló la subida');expect(upload).toHaveBeenCalledWith(file);expect(onUpload).not.toHaveBeenCalled();});
